---
tags: [M5Stack]
---
# M5Stack の開発環境構築（LSP編）

M5Stack CoreInk を購入しました。さっそく使おうとしたのですが、どうも LSP がうまく設定できず、変なエラーを出力するのを防ぐことができなくて大変苦労しました。

<figure>
<img alt="LSPがエラーを吐く様子" src="https://res.cloudinary.com/aiotter/image/upload/v1646702252/aiotter.com/Screenshot_2022-03-08_at_10.17.25_bxldw8.png">
<figcaption>LSPがエラーを吐く様子</figcaption>
</figure>

このエラーを解決する方法を残しておきます。

**当初この記事は ccls の設定方法を説明していましたが、clangd を使用するととても簡単に設定できることが分かったため、記事を書き直しました。
ccls の設定方法は記事の最後に残してありますが、clangd の使用をおすすめします。**

## 環境

* macOS 12.2.1
* PlatformIO v5.2.5 (Core)
* Neovim v0.6.1
* vim-lsp
* clangd (C/C++ の Language Server)

## 設定方法

### clangd のビルド

Espressif の LLVM フォークを clone し、README に従ってビルドします。めちゃめちゃ時間かかるので覚悟してください。
`clangd` が欲しいので `-DLLVM_ENABLE_PROJECTS=clang;clang-tools-extra` を指定しましょう。

<https://github.com/espressif/llvm-project>

### vim-lsp の設定

clangd は PlatformIO の出力する `compile_commands.json` を解釈できます。
ただし、 `clang` 以外のコンパイラを使うように指定されているときは [Query-driver](https://clangd.llvm.org/design/compile-commands#query-driver) の設定が必要です。
`--query-driver` オプションに実行しても安全なコンパイラの名前を指定することで、意図しない実行可能ファイルの実行を防ぐ仕組みとなっているためです。

vim-lsp をこのように設定することで、 PlatformIO 環境上でのみ^[platformio.ini の存在を認識して動作を切り替えます] clangd の設定を変更して M5 用のコンパイラを使用させることができます。

```vim
let s:pio_project_root = lsp#utils#find_nearest_parent_file_directory(lsp#utils#get_buffer_path(), "platformio.ini")
if s:pio_project_root->strlen() > 0 && executable("pio") && executable("clangd")
  let s:pio_core = system("pio system info --json-output")->json_decode().core_dir.value
  let s:compile_commands = glob(s:pio_project_root . '/.pio/**/compile_commands.json')->split("\n")[0]->fnamemodify(':p:h')

  au User lsp_setup call lsp#register_server({
  \ 'name': 'clangd',
  \ 'cmd': ['/path/to/your/xtensa/clangd', '-background-index',
  \         '--query-driver=' . s:pio_core . '/packages/*/bin/*',
  \         '--compile-commands-dir=' . s:compile_commands,
  \        ],
  \ 'allowlist': ['c', 'cpp', 'objc', 'objcpp', 'cc'],
  \ })
endif
```

新しいライブラリをインストールしたら `pio run -t compiledb` を実行して `compile_commands.json` を更新してください。
複数の `compile_commands.json` が検出した場合、最初に検出したもののみを使用します。

認識できないコンパイラオプションが含まれていることがあり、それがエラーを吐くので適宜 `.clangd` で取り除いてください。

```yml
CompileFlags:
  # Add: [-isysroot=/User/aiotter/.platformio/packages/toolchain-xtensa32/xtensa-esp32-elf/sysroot/]
  Remove: [-fstrict-volatile-bitfields]
```
isysroot を設定する必要があるらしいんですが、PlatformIO ではこれは指定しなくても動くようです。
もしこの指定がないと動かなかった方がいたら教えて下さい。

設定は以上です。お疲れさまでした。

---

# M5Stack の開発環境構築（LSP編 - ccls バージョン）

ここから先はこの記事の古いバージョンです。
ccls の設定は面倒くさいのでやめたほうが良さそうです。

## 環境

* macOS 12.2.1
* PlatformIO v5.2.5 (Core)
* Neovim v0.6.1
* vim-lsp
* ccls (C/C++ の Language Server。 **自前でビルドする必要があります。** 詳しくは後述します)

## 設定方法

### CCLS の設定編

次のコードを実行すると、カレントディレクトリが PlatformIO のプロジェクトとして設定されます^[具体的には `platformio.ini` を含む必要なファイル/ディレクトリが生成されます]。この際、`--ide=vim` のオプションによりカレントディレクトリに必要な設定をした `.ccls` が生成されます。

```bash
$ pio project init --ide=vim
```

このコマンドは何度でも実行でき、そのたびにインストール済みのライブラリへのパスをすべて含んだ新しい `.ccls` が生成されます。したがって、新しいライブラリを作成するたびにこの作業を行う必要があります。

作成される `.ccls` ですが、実際のコンパイル時に使用されるコンパイラに関わらず、常に `clang` がコンパイラドライバとして指定されています（`.ccls` の 1 行目は常に `clang` となっています）。LSP がエラーを吐く原因はここにあるようです。

実際使用されるコンパイラは `pio project data` で出力される `cc_path`(C), `cxx_path`(C++) のいずれかです（多分）。どちらが使用されるかは `compiler_type` によって決まるんじゃないかなと思います。 

というわけで `.ccls` の1行目を `pio project data` の `cxx_path` に書き換えますが、これだけでは解決しません。`ccls` が内部で使っている `clang` がこの `cxx_path` のコンパイラを有効なドライバとして使用できないようです^[このあたり自分でも何言っているのかよく分かっていないので識者の方のツッコミをお待ちしてます]。よく分からないんですが、 `stddef.h` や `stdint.h` のような一部のヘッダーファイルは `clang` のリソースディレクトリ内部にあり、macOS の `clang` は macOS 用のヘッダーファイルを参照するので、ここが M5 用のものと異なっているということなのかなと思っています。

このあたりをうまく動かすためには、 Espressif の提供する Xtensa 用の LLVM に含まれる `clang` を使用して `ccls` をコンパイルする必要があります。

### ccls のコンパイル編

順番が前後しましたが、ここで `ccls` のビルドを行います。ビルド方法については公式の wiki を参考にしてください。

<https://github.com/MaskRay/ccls/wiki/Build>

注意点として、`-DCMAKE_PREFIX_PATH` オプションには Xtensa 用の LLVM に含まれる `clang` を使用します。というわけで、 `ccls` の前に LLVM をコンパイルします。

Espressif の LLVM フォークを clone し、README に従ってビルドします。めちゃめちゃ時間かかるので覚悟してください。
Release のビルド済みバイナリを使いたいところですが、cmake 関係のファイルが足りなくてエラーになるため、自前でビルドする必要があります。
`clang` が欲しいので `-DLLVM_ENABLE_PROJECTS=clang;clang-tools-extra` を指定しましょう。clang-tools-extra は不要かな？

<https://github.com/espressif/llvm-project>

LLVM と `ccls` のコンパイルが終わったら、あとはその `ccls` を使うだけです。

### vim-lsp の設定編

これは [ccls の wiki](https://github.com/MaskRay/ccls/wiki/vim-lsp) に書いてあるままで大丈夫です。私は `.ccls` をルートディレクトリとして認識させるように少しいじりました。

```vim
if executable('ccls')
  let s:compile_commands_path = glob('.pio/**/compile_commands.json')->fnamemodify(':p:h')
  au User lsp_setup call lsp#register_server({
     \ 'name': 'ccls',
     \ 'cmd': ['ccls'],
     \ 'root_uri': {server_info->lsp#utils#path_to_uri(
     \   lsp#utils#find_nearest_parent_file_directory(
     \     lsp#utils#get_buffer_path(),
     \     ['.ccls', 'compile_commands.json', '.git/']
     \   ))},
     \ 'initialization_options': {'cache': {'directory': expand('~/.cache/ccls') }},
     \ 'allowlist': ['c', 'cpp', 'objc', 'objcpp', 'cc'],
     \ })
endif
```

設定は以上です。お疲れさまでした。

## 余談

私の今回の解決策はこのコメントのおかげで出来上がりました。

<https://github.com/espressif/esp-idf/issues/6721#issuecomment-997150632>

[@tolgraven](https://github.com/tolgraven) に感謝します🙏

この issue では clangd でうまくいった人が複数いるんですが、私は clangd はどうしてもうまく動かせませんでした。PlatformIO の生成する `compile_commands.json` に問題があるんじゃないかなと思っていますが、どうなんでしょうね。

動くようになるまでに LLVM も ccls もビルドしなきゃいけなくて工程が多すぎるので、LLVM のビルドだけで済ませられないかなーと思っています。また今度もう一度 `clangd` に挑戦してみたいですね。
