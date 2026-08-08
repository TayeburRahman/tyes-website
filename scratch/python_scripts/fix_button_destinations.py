import os
import re

html_files = [
    'public/main.html',
    'public/pricing.html',
    'public/how-it-works.html',
    'public/services.html',
    'public/use-cases.html',
    'public/landing.html'
]

def update_href(html):
    # We want to replace href="..." with href="signin.html" for <a> tags that contain the specific texts.
    # Since regex parsing of HTML can be flaky, let's use a simpler approach.
    # We split the HTML into chunks starting with '<a '
    chunks = html.split('<a ')
    new_html = chunks[0]
    
    for chunk in chunks[1:]:
        # Find the end of the a tag
        end_idx = chunk.find('</a>')
        if end_idx != -1:
            a_content = chunk[:end_idx]
            if "Get Started" in a_content or "Get My Free Strategy" in a_content or "Get Your Free Image" in a_content or "Get Your Free Strategy" in a_content:
                # Replace href="..." with href="signin.html"
                chunk = re.sub(r'href="[^"]+"', 'href="signin.html"', chunk, count=1)
        new_html += '<a ' + chunk
    return new_html

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = update_href(content)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)

