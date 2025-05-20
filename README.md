# Bets Off - Chrome Extension

A Chrome extension to block gambling ads, prevent access to betting sites, and protect users from unwanted gambling content while browsing the web.

## Features

- Blocks gambling-related advertisements
- Prevents access to known gambling websites
- Highlights gambling content on regular websites
- Provides statistics on blocked content
- Offers resources for gambling addiction support

## Adding New Gambling Domains or Keywords

To add new gambling domains or keywords to the block list, simply append them to the `data/gambling-domains.txt` file (one domain or keyword per line) and rebuild the rules:

```bash
echo "bovada" >> data/gambling-domains.txt && npm run build:rules
```

This will automatically generate the necessary declarativeNetRequest rules for the Chrome extension.