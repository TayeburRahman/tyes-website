import os
import glob

html_files = glob.glob('public/**/*.html', recursive=True)

script = """
<script>
  // Custom Newsletter Form Submission
  document.addEventListener("DOMContentLoaded", function() {
    // Wait a brief moment to ensure Webflow JS has initialized so we can override
    setTimeout(function() {
      const newsletterForms = document.querySelectorAll('form[name="wf-form-Newsletter-Email-Form"], form[id^="wf-form-Newsletter-Email-Form"]');
      
      newsletterForms.forEach(form => {
        // Clone the form to completely strip Webflow's attached event listeners
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        newForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const emailInput = newForm.querySelector('input[type="email"]');
          const submitBtn = newForm.querySelector('input[type="submit"]');
          const parentBlock = newForm.closest('.w-form') || newForm.parentElement;
          const successMsg = parentBlock.querySelector('.w-form-done');
          const errorMsg = parentBlock.querySelector('.w-form-fail');
          
          const originalBtnText = submitBtn.value;
          submitBtn.value = "Please wait...";
          submitBtn.disabled = true;
          
          if(successMsg) successMsg.style.display = "none";
          if(errorMsg) errorMsg.style.display = "none";
          
          try {
            const res = await fetch('/api/newsletter', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emailInput.value })
            });
            
            if (res.ok) {
              newForm.style.display = "none";
              if(successMsg) successMsg.style.display = "block";
            } else {
              if(errorMsg) errorMsg.style.display = "block";
              submitBtn.value = originalBtnText;
              submitBtn.disabled = false;
            }
          } catch (err) {
            console.error(err);
            if(errorMsg) errorMsg.style.display = "block";
            submitBtn.value = originalBtnText;
            submitBtn.disabled = false;
          }
        });
      });
    }, 500);
  });
</script>
</body>
"""

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'Newsletter-Email' in content and 'Custom Newsletter Form Submission' not in content:
            new_content = content.replace('</body>', script)
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)

