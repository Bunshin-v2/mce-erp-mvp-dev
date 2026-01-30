import pandas as pd
import os

def extract_excel(file_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    xl = pd.ExcelFile(file_path)
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        filename = f"{sheet.replace(' ', '_').lower()}.csv"
        df.to_csv(os.path.join(output_dir, filename), index=False)
        print(f"Exported: {sheet} -> {filename}")

if __name__ == "__main__":
    extract_excel('mce_data_dictionary (FINAL)(13-01-2026).xlsx', 'data_exports')
