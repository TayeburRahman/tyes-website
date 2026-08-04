import re

with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The marquee HTML
marquee_html = """
    <!-- Brands Marquee Section -->
    <section class="brands-marquee">
      <p class="eyebrow">Few of the brands we've worked with</p>
      <div class="marquee-track">
        <img src="images/Amsterdam.svg" alt="Amsterdam" />
        <img src="images/Delaware.svg" alt="Delaware" />
        <img src="images/Monaco.svg" alt="Monaco" />
        <img src="images/Springfield.svg" alt="Springfield" />
        <img src="images/Sweden.svg" alt="Sweden" />
        <img src="images/Umbrella.svg" alt="Umbrella" />
        <img src="images/Amsterdam.svg" alt="Amsterdam" />
        <img src="images/Delaware.svg" alt="Delaware" />
        <img src="images/Monaco.svg" alt="Monaco" />
        <img src="images/Springfield.svg" alt="Springfield" />
        <img src="images/Sweden.svg" alt="Sweden" />
        <img src="images/Umbrella.svg" alt="Umbrella" />
      </div>
    </section>
"""

# We need to find the end of the <section class="section-home-use-cases" id="use-cases">.
# The section starts at line 712. Let's find the matching closing tag.
# A simple way in Python is to use BeautifulSoup, but since we might not have it, let's write a simple tag matcher.
def get_closing_tag_index(html, start_index):
    open_tags = 0
    i = start_index
    while i < len(html):
        if html[i:i+8] == '<section':
            open_tags += 1
        elif html[i:i+10] == '</section>':
            if open_tags == 0:
                return i + 10 # return index after the closing tag
            else:
                open_tags -= 1
        i += 1
    return -1

start_idx = content.find('<section class="section-home-use-cases" id="use-cases">')
if start_idx != -1:
    end_idx = get_closing_tag_index(content, start_idx + 8) # skip the first '<section'
    if end_idx != -1:
        new_content = content[:end_idx] + "\n" + marquee_html + content[end_idx:]
        with open('public/main.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Injected HTML successfully.")
    else:
        print("Could not find closing section tag.")
else:
    print("Could not find starting section tag.")

