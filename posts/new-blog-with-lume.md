---
tags: [tech, blog]
---

# ブログをリニューアルしました

以前からブログのデザインが気に入らなかったので直したいと思っていたんですが、たまたま仕事で React を学ぶ機会があったので、ちょうど良い機会だと思って今まで全部ライブラリに頼っていた部分をだいぶ書き直してリニューアルしました。

## SSG を変更しました

今までは Go 製の Hugo を使用していました。

私は Go を知らないので完全にただのユーザーとして Hugo を使っていたのですが、最近 [deno](https://deno.land) を使うようになったので TypeScript で書かれて deno で動く [Lume](https://lumeland.github.io) に移行しました。

Lume は Markdown や Asciidoc などのリソースの読み込みをすべて画一的な Engine というクラスを用いて実現し、 Engine やプリプロセッサ、ポストプロセッサをまとめてプラグインとして読み込む仕組みとなっています。この思想は徹底されていて、デフォルトで有効になっている Markdown についてもこのプラグインとして実装されています。Markdown のレンダリングエンジンを自分で書いて既存のものと入れ替えることも可能です。

deno は JSX/TSX をサポートしているので、React でレイアウトを作成することもできます[^1]。クライアントサイドのスクリプトについても deno の bundler を使って TypeScript からコンパイルできるので楽ですね。

[^1]: このウェブサイトでは [Nano JSX](https://nanojsx.io) を用いて TSX をレンダリングしています。Nano JSX は deno をサポートする軽量な JSX/TSX エンジンで、基本的に SSR で描画して必要な部分だけを後から hydration するという仕組みで作られています。

ただ Lume にはまだ未熟だなあと思う部分もあり、今後の発展に期待しつつ使っている感じですね。疑問点はコントリビューションのチャンスだと思って Issue や PR を立てつつ使っています。

### Lume プラグインの作成

Lume に移行するにあたり、必要なプラグインを自作しました。作成したものの一部は使用していませんが、念の為残してあります。

こちらから一覧を見ることができます:
<https://github.com/aiotter/blog/tree/e85e360dbb756bd66f27ad607f918f16a5d64175/_plugins>

実際にブログで使われているものはこの 7 種です:

* **asciidoctor-js.ts**: Asciidoctor の文書をクライアントサイドでレンダリングする
* **auto-title.ts**: 記事タイトルを最初の H1 タグから取得する
* **date-from-git.ts**: 記事の作成日および更新日を git の編集履歴から取得する
* **mdx.ts**: [MDX](mdxjs.com)をレンダリングする
* **nano-jsx.ts**: [Nano JSX](https://nanojsx.io) で書かれた JSX/TSX をレンダリングする
* **sass.ts**: [SASS](https://sass-lang.com) を [Dart SASS](https://sass-lang.com/dart-sass) を用いて CSS にコンパイルする
* **windicss.ts**: [TailwindCSS](https://sass-lang.com/dart-sass) を [Windi CSS](https://windicss.org) を用いてレンダリングする


### Deno の制約

Deno は ES Module しかインポートできないので、Node.js 用のライブラリを使おうとすると ES Module への変換が必要になります。
[この記事](https://zenn.dev/uki00a/articles/how-to-use-npm-packages-in-deno)に詳しく書いてありますが、 <https://esm.sh> や <https://skypack.dev> を用いることで CommonJS 形式の JavaScript ライブラリを ES Module に自動変換して読み込むことができます。前者は Node.js の API を Deno の Node.js 互換ライブラリの API に読み替えてくれる超つよいやつです。

ですが、ES Module は Strict mode で書かなくてはならない制約があるため、Strict mode で書かれていない JavaScript は自動変換がうまくいきません。それが理由で Asciidoctor.js を deno で動かすことはできませんでした。

deno で動かないならブラウザで動かせばいいじゃんってことで、過去の asciidoc で書かれた記事は asciidoc のまま HTML に埋め込んでおき、みなさんの手元のブラウザで HTML に変換する仕様にしました。力業ですね。

## Asciidoc をやめて Markdown に移行しました

以前 asciidoc は最高、みたいな話をした覚えがあるんですが、 asciidoc の構文は思ったより慣れるのに時間がかかり、いつまでたってもチートシートを見ながらドキュメントを書く格好となってしまったため Markdown に出戻りしました。

Markdown は複雑な文書を表現するための文法が存在しないことが Asciidoc に手を出した一番大きな要因でした。複雑なことを表現しようとするとすぐに Markdown の基本的な文法から逸脱するので、文法を拡張せざるを得ず、そのせいで方言が乱立していると認識していました。そもそもその「基本的な文法」なるものが Markdown 自体には定められていないんですね。

ところが、 [CommonMark <img src="https://raw.githubusercontent.com/dcurtis/markdown-mark/master/png/32x20.png" alt="Markdown Logo" height="20" width="32" style="vertical-align:top; display:inline-block">](https://commonmark.org) という標準的な規格があることが分かりました。この規格は Markdown の基本的な文法を定めたもので、例えば GitHub Flavoured Markdown (GFM) は CommonMark の拡張としてその規格を定めています。Markdown 自体には規格は存在しませんが、CommonMark に従っている限りにおいては Markdown の文法は定められているとみなすことができるわけです。

CommonMark は Markdown の文法と HTML のタグを 1:1 に結びつけることで Markdown の文法を定めています。そして CommonMark では Markdown の中に生の HTML タグを埋め込むことを許容しています。したがって CommonMark に定められていない書き方をしたいときには直接 HTML タグとして記述してしまえば良いわけです。これは手軽で拡張性もあり可搬性に優れた良いドキュメントの記述方法だと思ったので、CommonMark を採用することにしました。

## 感想

結構たいへんでした。
コメントとかもろもろ未実装なのではやめにそっちも実装したいです。
あとは SEO ですね……
