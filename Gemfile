source "https://rubygems.org"
gem "jekyll", "~> 4.2.0"
gem "webrick", "~> 1.7"
gem "pygments.rb", '~> 1.1.2'
gem "plainwhite", "~> 0.13"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-asciidoc"
  gem 'asciidoctor-diagram'
  gem "jekyll-archives"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
