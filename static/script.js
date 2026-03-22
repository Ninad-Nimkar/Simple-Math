// ── Floating 1th Symbols ──────────────────────────────────
    (() => {
      const symbols = ['+', '−', '×', '÷', '=', '∑', '∫', 'π', '√', 'Δ', '∞', 'θ', 'λ', '∂'];
      const container = document.getElementById('mathBg');

      function createSymbol() {
        const el = document.createElement('span');
        el.className = 'math-symbol';
        el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        el.style.left = Math.random() * 100 + '%';
        el.style.fontSize = (Math.random() * 40 + 24) + 'px';
        el.style.animationDuration = (Math.random() * 25 + 20) + 's';
        el.style.animationDelay = (Math.random() * -30) + 's';
        container.appendChild(el);

        // Remove when animation ends to prevent buildup
        el.addEventListener('animationend', () => {
          el.remove();
          createSymbol();
        });
      }

      // Spawn initial batch
      for (let i = 0; i < 18; i++) createSymbol();
    })();

    // ── DOM Elements ────────────────────────────────────────────
    const form         = document.getElementById('solveForm');
    const problemInput = document.getElementById('problemInput');
    const levelSelect  = document.getElementById('levelSelect');
    const fileInput    = document.getElementById('fileInput');
    const uploadArea   = document.getElementById('uploadArea');
    const fileNameEl   = document.getElementById('fileName');
    const solveBtn     = document.getElementById('solveBtn');
    const spinner      = document.getElementById('spinner');
    const btnText      = document.getElementById('btnText');
    const resultWrapper= document.getElementById('resultWrapper');
    const resultLabel  = document.getElementById('resultLabel');
    const resultBox    = document.getElementById('resultBox');

    // ── Custom Dropdown ──────────────────────────────────────────
    const customSelect  = document.getElementById('customSelect');
    const selectTrigger = document.getElementById('selectTrigger');
    const selectOptions = document.querySelectorAll('.custom-select-option');

    selectTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      customSelect.classList.toggle('open');
    });

    selectOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.dataset.value;
        levelSelect.value = value;
        selectTrigger.textContent = value;
        selectTrigger.classList.remove('placeholder');
        selectOptions.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        customSelect.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      customSelect.classList.remove('open');
    });

    // ── File Input Handling ──────────────────────────────────────
    fileInput.addEventListener('change', () => {
      const compactFN = document.getElementById('compactFileName');
      const compactBtn = document.getElementById('compactUploadBtn');
      
      if (fileInput.files.length > 0) {
        fileNameEl.textContent = '📎 ' + fileInput.files[0].name;
        fileNameEl.classList.add('visible');
        uploadArea.classList.add('has-file');
        
        if (compactFN) {
          compactFN.textContent = '📎 ' + fileInput.files[0].name;
          compactFN.classList.add('visible');
        }
        if (compactBtn) {
          compactBtn.classList.add('has-file');
        }
      } else {
        fileNameEl.classList.remove('visible');
        uploadArea.classList.remove('has-file');
        
        if (compactFN) {
          compactFN.classList.remove('visible');
        }
        if (compactBtn) {
          compactBtn.classList.remove('has-file');
        }
      }
    });


    // ── Form Submit ──────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const problem = problemInput.value.trim();
      const level   = levelSelect.value;
      const file    = fileInput.files[0];

      // Validation
      if (!level) {
        showError('Please select a student level.');
        return;
      }

      if (!problem && !file) {
        showError('Please enter a math problem or upload an image.');
        return;
      }

      // Build FormData
      const formData = new FormData();
      if (problem) formData.append('problem', problem);
      formData.append('level', level);
      if (file) formData.append('file', file);

      // UI → Loading state
      setLoading(true);
      resultWrapper.classList.remove('visible');
      resultWrapper.classList.remove('error');

      try {
        const res = await fetch('http://127.0.0.1:8000/solve', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.error) {
          showError(data.error);
        } else {
          showResult(data.solution || 'No solution returned.');
          // Collapse the form
          document.querySelector('.card').classList.add('collapsed');
          
          // Clear inputs
          problemInput.value = '';
          fileInput.value = '';
          fileNameEl.textContent = '';
          fileNameEl.classList.remove('visible');
          uploadArea.classList.remove('has-file');
          
          const compactFN = document.getElementById('compactFileName');
          if (compactFN) compactFN.classList.remove('visible');
          const compactBtn = document.getElementById('compactUploadBtn');
          if (compactBtn) compactBtn.classList.remove('has-file');
        }
      } catch (err) {
        showError('Could not connect to the server. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    });

    // ── Helpers ──────────────────────────────────────────────────
    function setLoading(on) {
      solveBtn.disabled = on;
      spinner.classList.toggle('visible', on);
      btnText.textContent = on ? 'Solving…' : 'Solve';
    }

    function showResult(text) {
      resultWrapper.classList.remove('error');
      resultLabel.textContent = 'Solution';

      // Protect math expressions from markdown parsing
      const mathBlocks = [];
      let processed = text;

      // Protect display math: $$...$$ and \[...\]
      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (m) => {
        mathBlocks.push(m);
        return `MATHBLOCK${mathBlocks.length - 1}END`;
      });
      processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (m) => {
        mathBlocks.push('$$' + m.slice(2, -2) + '$$');
        return `MATHBLOCK${mathBlocks.length - 1}END`;
      });

      // Protect inline math: \(...\) and $...$
      processed = processed.replace(/\\\((.*?)\\\)/g, (m) => {
        mathBlocks.push('$' + m.slice(2, -2) + '$');
        return `MATHBLOCK${mathBlocks.length - 1}END`;
      });
      processed = processed.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)\$/g, (m) => {
        mathBlocks.push(m);
        return `MATHBLOCK${mathBlocks.length - 1}END`;
      });

      // Parse markdown
      let html = marked.parse(processed);

      // Restore math expressions
      mathBlocks.forEach((block, i) => {
        html = html.replaceAll(`MATHBLOCK${i}END`, block);
      });

      resultBox.innerHTML = html;

      // Render LaTeX math expressions with KaTeX
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(resultBox, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
      resultWrapper.classList.add('visible');
      // Re-trigger animation
      resultWrapper.style.animation = 'none';
      resultWrapper.offsetHeight; // force reflow
      resultWrapper.style.animation = '';
    }

    function showError(text) {
      resultWrapper.classList.add('error');
      resultLabel.textContent = 'Error';
      resultBox.textContent = text;
      resultWrapper.classList.add('visible');
      resultWrapper.style.animation = 'none';
      resultWrapper.offsetHeight;
      resultWrapper.style.animation = '';
    }
