    // Keywords for basic analysis
    const keywords = ["Java", "Spring", "REST API", "Angular", "Leadership", "Project", "Team", "SQL", "Communication"];

    function analyzeResume() {
      const input = document.getElementById("resumeInput");
      const feedback = document.getElementById("feedback");
      const error = document.getElementById("error");
      feedback.style.display = "none";
      error.textContent = "";

      if (!input.files || input.files.length === 0) {
        error.textContent = "Please upload a resume file.";
        return;
      }

      const file = input.files[0];
      const fileType = file.name.split('.').pop().toLowerCase();

      if (!["txt", "pdf", "docx"].includes(fileType)) {
        error.textContent = "Only .txt, .pdf, and .docx files are supported.";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        processText(text);
      };

      if (fileType === "txt") {
        reader.readAsText(file);
      } else if (fileType === "pdf") {
        readPDF(file);
      } else if (fileType === "docx") {
        readDOCX(file);
      }
    }

    function readPDF(file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const pdfData = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(pdfData).promise.then(function (pdf) {
          let text = "";
          const numPages = pdf.numPages;

          const getTextFromPage = (pageNum) => {
            return pdf.getPage(pageNum).then(function (page) {
              return page.getTextContent().then(function (textContent) {
                return textContent.items.map(item => item.str).join(" ");
              });
            });
          };

          const extractText = async () => {
            for (let i = 1; i <= numPages; i++) {
              text += await getTextFromPage(i);
            }
            processText(text);
          };

          extractText();
        });
      };
      reader.readAsArrayBuffer(file);
    }

    function readDOCX(file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
          .then(function (result) {
            processText(result.value);
          })
          .catch(function (err) {
            error.textContent = "Error reading DOCX file.";
          });
      };
      reader.readAsArrayBuffer(file);
    }

    function processText(text) {
      const feedback = document.getElementById("feedback");
      const foundKeywords = keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));

      let tips = "";
      if (foundKeywords.length === 0) {
        tips = "<li>Try adding more industry-relevant keywords.</li>";
      } else {
        tips = foundKeywords.map(kw => `<li>✔️ Contains keyword: <strong>${kw}</strong></li>`).join("");
      }

      // Formatting and readability
      const lines = text.split("\n");
      const longLines = lines.filter(line => line.length > 120);
      const bulletPoints = text.match(/\*/g) || [];

      const formattingTips = `
        <li>${longLines.length > 0 ? `Consider shortening ${longLines.length} long lines for better readability.` : "Good line lengths!"}</li>
        <li>${bulletPoints.length < 5 ? "Try using more bullet points to enhance clarity." : "Sufficient use of bullet points."}</li>
      `;

      feedback.innerHTML = `
        <h3>Feedback Summary:</h3>
        <ul>${tips}${formattingTips}</ul>
      `;
      feedback.style.display = "block";
    }
