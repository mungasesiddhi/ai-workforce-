import pdfplumber

pdf_path = r'C:\Users\vaish\Downloads\sama\Safenest_Report_Final_Zip_File.pdf'
with pdfplumber.open(pdf_path) as pdf:
    with open('report_future_scope.txt', 'w', encoding='utf-8') as f:
        for i in range(75, 95): 
            if i < len(pdf.pages):
                text = pdf.pages[i].extract_text()
                if text:
                    f.write(f"--- PAGE {i+1} ---\n")
                    f.write(text + "\n")
