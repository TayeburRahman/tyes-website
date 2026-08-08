files = ['public/landing.html', 'public/landing/index.html']

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        old_js = """      if (text.includes('Get Your Free Image')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/auth';
      } else if (text.includes('Get Your Free Strategy')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'main.html';
      }"""
        
        new_js = """      if (text.includes('Get Your Free Image')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'signin.html';
      } else if (text.includes('Get Your Free Strategy') || text.includes('Get Started') || text.includes('Get My Free Strategy')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'signin.html';
      }"""
      
        content = content.replace(old_js, new_js)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
    except FileNotFoundError:
        pass

