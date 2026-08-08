import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove .section-home-service
pattern_service = re.compile(r'<section class="section-home-service">.*?</section>\n', re.DOTALL)
content = re.sub(pattern_service, '', content)

# Remove .section-home-how-it-works
pattern_how_it_works = re.compile(r'<section class="section-home-how-it-works">.*?</section>\n', re.DOTALL)
content = re.sub(pattern_how_it_works, '', content)

with open('public/main.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed old sections")
