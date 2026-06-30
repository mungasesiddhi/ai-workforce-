import pdfplumber

pdf_path = r'C:\Users\vaish\Downloads\sama\Safenest_Report_Final_Zip_File.pdf'
with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}\n")
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            print(f"--- PAGE {i+1} ---")
            print(text[:1000]) # Print first 1000 chars of each page
            print("...")
        if i >= 4: # Read first 5 pages only
            break
