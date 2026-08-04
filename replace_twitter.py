import os

html_files = [
    'public/main.html',
    'public/pricing.html',
    'public/how-it-works.html',
    'public/services.html',
    'public/use-cases.html',
    'public/landing.html',
    'public/landing/index.html',
    'public/signin.html'
]

old_twitter = """<a href="https://twitter.com/" target="_blank" class="link-item w-inline-block">
                <div class="link-wrap">
                  <div class="link-text">Twitter - X</div>
                </div>
              </a>"""

new_facebook = """<a href="https://facebook.com/" target="_blank" class="link-item w-inline-block">
                <div class="link-wrap">
                  <div class="link-text">Facebook</div>
                </div>
              </a>"""

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content.replace(old_twitter, new_facebook)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)

