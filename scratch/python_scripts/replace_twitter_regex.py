import os
import re
import glob

html_files = glob.glob('public/**/*.html', recursive=True)

# Regex to match the anchor tag for Twitter
# It looks for <a href="https://twitter.com/".*?> ... <div class="link-text">Twitter - X</div> ... </a>
# Or similar patterns. We can just replace the specific text "Twitter - X" with "Facebook"
# and "https://twitter.com/" with "https://facebook.com/"
# But wait, there might be 'is-hover' text as well. So let's replace "Twitter - X" with "Facebook"
# and "https://twitter.com/" with "https://facebook.com/" globally in those files.

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "Twitter - X" in content or "twitter.com" in content:
            # Safely replace twitter URL and text
            new_content = content.replace("Twitter - X", "Facebook")
            new_content = new_content.replace("https://twitter.com/", "https://facebook.com/")
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)

