export class PDFParser {
    /**
     * Dynamically injects the pdf.js script into the browser document
     * to completely bypass Next.js Webpack SSR compilation bugs.
     */
    static async loadPdfJs(): Promise<any> {
        if (typeof window === 'undefined') return null;
        if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // Using a stable v3 version that doesn't conflict with modern bundlers
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                const pdfjsLib = (window as any).pdfjsLib;
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(pdfjsLib);
            };
            script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
            document.head.appendChild(script);
        });
    }

    /**
     * Extracts text from a PDF file.
     */
    static async extractText(file: File): Promise<string> {
        const pdfjsLib = await this.loadPdfJs();
        if (!pdfjsLib) return '';

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: { str: string }) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    }
}
