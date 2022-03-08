---
tags: [M5Stack]
---
# M5Stack の開発環境構築（LSP編）

M5Stack CoreInk を購入しました。さっそく使おうとしたのですが、どうも LSP がうまく設定できず、変なエラーを出力するのを防ぐことができなくて大変苦労しました。

<figure>
<img alt="LSPがエラーを吐く様子" src="https://res.cloudinary.com/aiotter/image/upload/v1646702252/aiotter.com/Screenshot_2022-03-08_at_10.17.25_bxldw8.png">
<figcaption>LSPがエラーを吐く様子</figcaption>
</figure>

このエラーを解決する方法を残しておきます。LLVM のビルドが必要なのでめちゃめちゃ時間かかります。覚悟してください。

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

 Espressif の LLVM フォークを clone し、README に従ってコンパイルします。めちゃめちゃ時間かかるので覚悟してください。ビルド済みバイナリを配布するとか中の人が言ってたの見たけどどうなったんかな……

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
