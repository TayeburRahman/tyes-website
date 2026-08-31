import os

def clean_escaped_quotes(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace('href=\\"', 'href="').replace('class=\\"', 'class="')
    new_content = new_content.replace('href=\\"', 'href="').replace('class=\\"', 'class="')

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned escaped quotes: {filepath}")

def main():
    root_dir = "/home/tayebur/project/tyes-website/public"
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.html'):
                clean_escaped_quotes(os.path.join(root, file))

if __name__ == "__main__":
    main()
