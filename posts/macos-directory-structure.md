---
tags: [macOS]
---

# macOS のディレクトリ構造

[XDG Base Directory Specification](https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html) ってありますやんか。
あれはざっくり言うと設定ファイルとかデータとかの保存場所を定めたものです。
XDG Base Directory Specification は Linux においてよく使用されていますが、macOS はそれとは異なるディレクトリ構造の規定があります。今回はその規定について調べてみました（テンプレの口上）。

ぶっちゃけもうこのリンクを貼ったら終わりみたいなところがありますが、 macOS の `/Library` および `~/Library` の構造はここに書かれています。

<https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/MacOSXDirectories/MacOSXDirectories.html#//apple_ref/doc/uid/TP40010672-CH10-SW1>

簡単に XDG Base Directory Specification との比較をまとめておきます。

| XDG Base Directory Specification | (default)      | macOS                                          |
| -------------------------------- | -------------- | ---------------------------------------------- |
| $XDG_DATA_HOME                   | ~/.local/share | ~/Library/Application Support                  |
| $XDG_CONFIG_HOME                 | ~/.config      | ~/Library/Preferences                          |
| $XDG_STATE_HOME                  | ~/.local/state | ~/Library/Autosave Information, ~/Library/Logs |
| $XDG_CACHE_HOME                  | ~/.cache       | ~/Library/Caches                               |

`~/Library/Autosave Information` を使ってるアプリ見たことないですね。私の環境では [Origami Studio](https://origami.design) だけでした。
Preferences に直にファイルを作るなって言われてしまっているので、CLI アプリがここにデータの保存をするのはちょっと勇気がいりますね。

いかがでしたか？　マジでいかがでしたかブログ並みの情報量ですが微妙に気になっていたのでメモ代わりにまとめてみました。
コンフィグファイルの保存場所として、例えば [lazygit](https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md) は Application Support を使っていますし、 [clangd](https://clangd.llvm.org/config#files) は Preferences を使ってます。バラバラでとってもしんどいですね。みんな XDG Base Directory Specification に従って欲しい……

あと XDG ってなんやねんって話ですが、これは現在の [freedesktop.org](https://www.freedesktop.org/wiki/) の旧称 X Desktop Group の略称とのことです。
