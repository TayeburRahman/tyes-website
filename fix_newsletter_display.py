import os
import glob

html_files = glob.glob('public/**/*.html', recursive=True)

old_script = """            if (res.ok) {
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
          }"""

new_script = """            const data = await res.json().catch(() => ({}));
            if (res.ok) {
              newForm.style.display = "none";
              if(successMsg) {
                successMsg.style.setProperty("display", "block", "important");
                successMsg.style.setProperty("background", "#4ecdc4", "important");
                successMsg.style.setProperty("color", "#000", "important");
                successMsg.style.setProperty("padding", "20px", "important");
                successMsg.style.setProperty("margin-top", "10px", "important");
              }
            } else {
              console.error("API Error:", data);
              alert("Error from Resend API: " + (data.error || "Unknown error"));
              if(errorMsg) {
                errorMsg.style.setProperty("display", "block", "important");
              }
              submitBtn.value = originalBtnText;
              submitBtn.disabled = false;
            }
          } catch (err) {
            console.error("Fetch error:", err);
            alert("Network error: " + err.message);
            if(errorMsg) {
               errorMsg.style.setProperty("display", "block", "important");
            }
            submitBtn.value = originalBtnText;
            submitBtn.disabled = false;
          }"""

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if old_script in content:
            new_content = content.replace(old_script, new_script)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(new_content)

