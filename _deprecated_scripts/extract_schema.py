import os

file_path = 'master_setup.sql'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='latin-1') as f:
        content = f.read()
        
    # Find projects_master
    start = content.find('CREATE TABLE projects_master')
    if start != -1:
        end = content.find(');', start)
        print("--- projects_master definition ---")
        print(content[start:end+2])
    else:
        print("projects_master not found")
        
    # Find tenders
    start = content.find('CREATE TABLE tenders')
    if start != -1:
        end = content.find(');', start)
        print("\n--- tenders definition ---")
        print(content[start:end+2])
    else:
        print("tenders not found")

    # Find notifications
    start = content.find('CREATE TABLE notifications')
    if start != -1:
        end = content.find(');', start)
        print("\n--- notifications definition ---")
        print(content[start:end+2])
    else:
        print("notifications not found")
else:
    print(f"{file_path} not found")
