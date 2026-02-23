# helloworld

A personal homepage built with Jekyll and hosted on GitHub Pages.

## Stack

- **Generator:** Jekyll (via `github-pages` gem)
- **Theme:** Minima
- **Hosting:** GitHub Pages

## Structure

```
helloworld/
├── _posts/          # Blog posts (YYYY-MM-DD-title.md)
├── _config.yml      # Site settings
├── index.md         # Homepage
├── Gemfile          # Ruby dependencies
└── .gitignore
```

## Writing a New Post

1. Create a file in `_posts/` named `YYYY-MM-DD-your-title.md`
2. Add front matter at the top:
   ```
   ---
   layout: post
   title: "Your Post Title"
   date: YYYY-MM-DD
   ---
   ```
3. Write your content in Markdown below the front matter
4. Push to `master` — GitHub Pages builds and publishes automatically

## Local Development (optional)

```bash
bundle install
bundle exec jekyll serve
# Visit http://localhost:4000
```
