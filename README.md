# 撮られたガールズ撮影会 - 静的HTML/CSSサイト

ワイヤーフレームに基づいて作成された静的HTML/CSSサイトです。後でWordPress化することを想定しています。

## 📁 ファイル構成

```
.
├── index.html                    # TOPページ
├── event-list.html               # EVENT一覧ページ
├── event-detail-group.html       # EVENT詳細ページ（グループ撮影会）
├── event-detail-individual.html  # EVENT詳細ページ（個人撮影会）
├── model-list.html               # MODEL一覧ページ
├── model-detail.html             # MODEL詳細ページ
├── first-timers.html             # 初めての方へページ
├── qa.html                       # Q&Aページ
├── rules.html                    # 撮影会のルールページ
├── contact.html                  # 問い合わせページ
├── recruitment.html              # モデル募集ページ
├── application.html              # 応募フォームページ
├── style.css                     # メインCSSファイル
├── js/
│   └── main.js                   # モバイルメニュー用JavaScript
├── avatar.png                    # 画像ファイル
└── README.md                     # このファイル
```

## 🎨 デザイン仕様

- **カラーパレット**: 
  - メイン: #111 (黒)
  - 背景: #fff (白)
  - アクセント: #f5f5f5 (ライトグレー)
  - エラー/強調: #d32f2f (赤)

- **フォント**: システムフォント（-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN"など）

- **コンテナ幅**: 最大1200px

- **メソッド**: BEM命名規則 + Flexbox/Grid

## 📱 レスポンシブ対応

- **デスクトップ**: 1200px以上
- **タブレット**: 768px以下（2カラムグリッド）
- **モバイル**: 480px以下（1カラムグリッド、ハンバーガーメニュー）

## 🚀 使い方

1. ブラウザで `index.html` を開いて確認
2. 各ページは独立したHTMLファイルとして動作
3. 後でWordPressテンプレートに変換可能

## 📝 WordPress化のポイント

以下のファイルがWordPressテンプレートに変換されます：

- `index.html` → `front-page.php` または `home.php`
- `event-list.html` → `archive-event.php`
- `event-detail-group.html` → `single-event.php` (グループ用)
- `event-detail-individual.html` → `single-event.php` (個人用)
- `model-list.html` → `archive-model.php`
- `model-detail.html` → `single-model.php`
- `first-timers.html` → `page-first-timers.php`
- `qa.html` → `page-qa.php`
- `rules.html` → `page-rules.php`
- `contact.html` → `page-contact.php`
- `recruitment.html` → `page-recruitment.php`
- `application.html` → `page-application.php`

## 🔧 カスタマイズ

- **ヘッダー/フッター**: 各HTMLファイルの `<header>` と `<footer>` セクションを編集
- **スタイル**: `style.css` を編集
- **JavaScript**: `js/main.js` を編集

## 📌 注意事項

- 画像は現在プレースホルダー（グレーの背景）として表示されています
- フォームの送信機能は実装されていません（WordPress化時に実装）
- モバイルメニューのトグル機能は `js/main.js` で実装済み

