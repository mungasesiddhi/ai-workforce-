import pdfplumber

pdf_path = r'C:\Users\vaish\Downloads\sama\Safenest_Report_Final_Zip_File.pdf'
with pdfplumber.open(pdf_path) as pdf:
    for i in range(5, 15): # Pages 6 to 15 (0-indexed 5 to 14)
        if i < len(pdf.pages):
            text = pdf.pages[i].extract_text()
            if text:
                print(f"--- PAGE {i+1} ---")
                print(text)
