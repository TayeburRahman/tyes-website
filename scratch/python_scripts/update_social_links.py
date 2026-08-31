import os

FACEBOOK_OLD_PATTERNS = [
    'href="https://facebook.com/"',
    'href="https://www.facebook.com/"',
    'href="https://facebook.com"',
    'href="https://www.facebook.com"'
]
FACEBOOK_NEW = 'href="https://www.facebook.com/profile.php?id=61578742552795"'

INSTAGRAM_OLD_PATTERNS = [
    'href="https://instagram.com/"',
    'href="https://www.instagram.com/"',
    'href="https://instagram.com"',
    'href="https://www.instagram.com"'
]
INSTAGRAM_NEW = 'href="https://www.instagram.com/tyes.app/"'

LINKEDIN_OLD_PATTERNS = [
    'href="https://linkedin.com/"',
    'href="https://www.linkedin.com/"',
    'href="https://linkedin.com"',
    'href="https://www.linkedin.com"'
]
LINKEDIN_NEW = 'href="https://www.linkedin.com/company/tyes-app/"'

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content

    for pat in FACEBOOK_OLD_PATTERNS:
        new_content = new_content.replace(pat, FACEBOOK_NEW)

    for pat in INSTAGRAM_OLD_PATTERNS:
        new_content = new_content.replace(pat, INSTAGRAM_NEW)

    for pat in LINKEDIN_OLD_PATTERNS:
        new_content = new_content.replace(pat, LINKEDIN_NEW)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

def main():
    root_dir = "/home/tayebur/project/tyes-website"
    file_extensions = ['.html', '.tsx', '.ts', '.jsx', '.js', '.md']
    
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules, .next, .git
        dirs[:] = [d for d in dirs if d not in ['.git', '.next', 'node_modules']]
        for file in files:
            if any(file.endswith(ext) for ext in file_extensions):
                filepath = os.path.join(root, file)
                update_file(filepath)

if __name__ == "__main__":
    main()
