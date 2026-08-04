with open('public/main.html', 'r', encoding='utf-8') as f:
    content = f.read()

js_code = """
  <script>
    // Mobile: tap toggles the flip (hover handles desktop)
    document.querySelectorAll('.flip').forEach(function (card) {
      card.addEventListener('click', function () { card.classList.toggle('tapped'); });
    });
  </script>
"""

if "card.classList.toggle('tapped')" not in content:
    content = content.replace('</body>', js_code + '\n</body>')
    with open('public/main.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added tap script.")
else:
    print("Tap script already exists.")
