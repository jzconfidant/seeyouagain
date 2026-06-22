// Text database with different difficulty levels
const textDatabase = {
    easy: [
        "The quick brown fox jumps over the lazy dog. This is a common sentence used for typing practice because it contains every letter in the alphabet.",
        "Hello world! Welcome to this typing practice. Keep your fingers on the home row and type slowly at first.",
        "A journey of a thousand miles begins with a single step. Practice makes perfect when learning to type.",
        "The sun is shining brightly in the clear blue sky. Birds are singing and flowers are blooming in the garden.",
        "She sells seashells by the seashore. The shells she sells are surely seashells.",
        "Technology is best when it brings people together. The internet connects us across the world in seconds.",
        "Reading books opens your mind to new ideas. A good book is like a good friend who never lets you down.",
        "The cat sat on the mat and looked at the rat. It was a quiet afternoon in the small house.",
        "Water is essential for life. We should drink enough water every day to stay healthy.",
        "Music has the power to change our mood. A happy song can make a bad day feel much better."
    ],
    medium: [
        "The advancement of artificial intelligence has transformed numerous industries. From healthcare to finance, machine learning algorithms are now capable of processing vast amounts of data with remarkable accuracy and speed.",
        "Climate change presents one of the greatest challenges facing humanity today. Rising temperatures, extreme weather events, and sea level rise threaten ecosystems and communities worldwide.",
        "The human brain contains approximately eighty-six billion neurons, each connected to thousands of others. This complex network enables consciousness, memory, learning, and the ability to process information at incredible speeds.",
        "Space exploration has always captured the imagination of humanity. From the first moon landing to the recent Mars rover missions, we continue to push the boundaries of what is possible.",
        "The Renaissance was a period of cultural, artistic, and intellectual rebirth in Europe. It began in Italy in the fourteenth century and spread across the continent, forever changing the course of history.",
        "Cryptocurrency and blockchain technology have disrupted traditional financial systems. While volatile, digital currencies offer decentralized alternatives that challenge conventional banking practices.",
        "The Great Barrier Reef is the world's largest coral reef system, composed of over two thousand nine hundred individual reefs. It is visible from space and home to countless marine species.",
        "Psychological research suggests that consistent practice, combined with adequate rest, leads to optimal skill acquisition. The brain requires time to consolidate learning during sleep.",
        "Renewable energy sources such as solar, wind, and hydroelectric power are becoming increasingly cost-effective. Many countries are investing heavily in green infrastructure to reduce carbon emissions.",
        "The art of programming requires both logical thinking and creativity. Writing clean, efficient code is a skill that develops over years of practice and continuous learning."
    ],
    hard: [
        "The phenomenon of quantum entanglement, which Einstein famously referred to as 'spooky action at a distance,' describes a physical occurrence that defies classical intuition. When two particles become entangled, the quantum state of each particle cannot be described independently, regardless of the spatial separation between them. This principle forms the foundation for emerging quantum computing and quantum cryptography technologies.",
        "Photosynthesis, the biochemical process by which green plants and certain other organisms transform light energy into chemical energy, involves an intricate series of reactions. During the light-dependent reactions, chlorophyll molecules absorb photons, exciting electrons that subsequently travel through an electron transport chain, ultimately generating ATP and NADPH, which are essential for the Calvin cycle.",
        "The geopolitical landscape of the twenty-first century is characterized by shifting alliances, economic interdependence, and the resurgence of great power competition. Nation-states must navigate complex diplomatic relationships while addressing transnational challenges including climate change, cybersecurity threats, and global health crises that require unprecedented levels of international cooperation.",
        "Neuroplasticity, the brain's remarkable ability to reorganize itself by forming new neural connections throughout life, challenges the long-held belief that the adult brain is fixed and immutable. Research has demonstrated that sustained cognitive activities, physical exercise, and enriched environments can significantly enhance synaptic plasticity and even promote neurogenesis in specific brain regions.",
        "The philosophical implications of artificial general intelligence raise profound questions about consciousness, free will, and the nature of humanity itself. As we develop increasingly sophisticated autonomous systems, society must grapple with ethical frameworks that address algorithmic bias, accountability for AI-driven decisions, and the potential socioeconomic disruptions that may fundamentally reshape labor markets.",
        "Epigenetics, the study of heritable changes in gene expression that do not involve alterations to the underlying DNA sequence, has revolutionized our understanding of biological inheritance. Environmental factors such as diet, stress, and exposure to toxins can modify chemical tags on DNA and histone proteins, influencing gene activation patterns that may persist across multiple generations.",
        "The field of computational linguistics intersects computer science, artificial intelligence, and linguistics to develop algorithms capable of processing and generating human language. Modern natural language processing systems employ transformer architectures with attention mechanisms, enabling unprecedented performance in machine translation, sentiment analysis, and conversational AI applications.",
        "Dark matter and dark energy constitute approximately ninety-five percent of the total mass-energy content of the universe, yet remain among the most enigmatic components of cosmology. While invisible and undetectable through electromagnetic radiation, their gravitational effects on visible matter, cosmic microwave background radiation, and the large-scale structure of the universe provide compelling evidence for their existence."
    ]
};

class TypingGame {
    constructor() {
        this.currentText = '';
        this.userInput = '';
        this.startTime = null;
        this.isRunning = false;
        this.isFinished = false;
        this.difficulty = 'easy';
        this.timer = null;
        this.errorCount = 0;
        this.totalChars = 0;
        
        this.initElements();
        this.initEventListeners();
        this.loadNewText();
        lucide.createIcons();
    }
    
    initElements() {
        this.textDisplay = document.getElementById('text-display');
        this.inputCapture = document.getElementById('input-capture');
        this.focusHint = document.getElementById('focus-hint');
        this.wpmDisplay = document.getElementById('wpm-display');
        this.accuracyDisplay = document.getElementById('accuracy-display');
        this.timeDisplay = document.getElementById('time-display');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.resultModal = document.getElementById('result-modal');
        this.resultContent = document.getElementById('result-content');
        
        this.resultWpm = document.getElementById('result-wpm');
        this.resultAccuracy = document.getElementById('result-accuracy');
        this.resultTime = document.getElementById('result-time');
        this.resultErrors = document.getElementById('result-errors');
        this.resultRating = document.getElementById('result-rating');
        this.resultRatingBar = document.getElementById('result-rating-bar');
    }
    
    initEventListeners() {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = btn.dataset.level;
                this.setDifficulty(level);
            });
        });
        
        // Typing area focus
        this.focusHint.addEventListener('click', () => {
            this.focusInput();
        });
        
        this.inputCapture.addEventListener('focus', () => {
            this.focusHint.style.display = 'none';
        });
        
        this.inputCapture.addEventListener('blur', () => {
            if (!this.isFinished) {
                this.focusHint.style.display = 'flex';
            }
        });
        
        // Input handling
        this.inputCapture.addEventListener('input', (e) => {
            this.handleInput(e);
        });
        
        this.inputCapture.addEventListener('keydown', (e) => {
            // Prevent default for Tab to use it as restart shortcut
            if (e.key === 'Tab') {
                e.preventDefault();
                this.restart();
            }
            
            // Handle backspace
            if (e.key === 'Backspace') {
                // Allow backspace
                return;
            }
            
            // Prevent if finished
            if (this.isFinished) {
                e.preventDefault();
                return;
            }
            
            // Start timer on first character
            if (!this.isRunning && e.key.length === 1) {
                this.startTimer();
            }
        });
        
        // Control buttons
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('new-text-btn').addEventListener('click', () => this.loadNewText());
        
        // Result modal buttons
        document.getElementById('result-restart-btn').addEventListener('click', () => {
            this.hideResult();
            this.restart();
        });
        
        document.getElementById('result-new-text-btn').addEventListener('click', () => {
            this.hideResult();
            this.loadNewText();
        });
        
        // Close modal on backdrop click
        this.resultModal.addEventListener('click', (e) => {
            if (e.target === this.resultModal) {
                this.hideResult();
            }
        });
        
        // Keyboard shortcut for restart (Ctrl+Enter or Cmd+Enter)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.restart();
            }
        });
        
        // Click on text display to focus
        document.getElementById('typing-container').addEventListener('click', () => {
            this.focusInput();
        });
    }
    
    setDifficulty(level) {
        this.difficulty = level;
        
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.level === level) {
                btn.classList.add('active');
            }
        });
        
        this.loadNewText();
    }
    
    loadNewText() {
        const texts = textDatabase[this.difficulty];
        this.currentText = texts[Math.floor(Math.random() * texts.length)];
        this.userInput = '';
        this.startTime = null;
        this.isRunning = false;
        this.isFinished = false;
        this.errorCount = 0;
        this.totalChars = 0;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.inputCapture.value = '';
        this.renderText();
        this.updateStats();
        this.focusInput();
    }
    
    restart() {
        this.userInput = '';
        this.startTime = null;
        this.isRunning = false;
        this.isFinished = false;
        this.errorCount = 0;
        this.totalChars = 0;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.inputCapture.value = '';
        this.renderText();
        this.updateStats();
        this.focusInput();
    }
    
    focusInput() {
        if (!this.isFinished) {
            this.inputCapture.focus();
            this.focusHint.style.display = 'none';
        }
    }
    
    renderText() {
        const chars = this.currentText.split('');
        const inputChars = this.userInput.split('');
        
        let html = '';
        
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const inputChar = inputChars[i];
            let className = 'char-pending';
            let content = char;
            
            if (i < inputChars.length) {
                if (inputChar === char) {
                    className = 'char-correct';
                } else {
                    className = 'char-wrong';
                    // Show the wrong character if it's not a space, otherwise show the original
                    if (char === ' ' && inputChar !== ' ') {
                        content = '•';
                    }
                }
            } else if (i === inputChars.length) {
                className = 'char-current';
            }
            
            // Handle newlines and spaces
            if (char === ' ') {
                if (className === 'char-current') {
                    html += `<span class="${className} inline-block min-w-[0.5em]">&nbsp;</span>`;
                } else if (className === 'char-wrong') {
                    html += `<span class="${className} inline-block min-w-[0.5em]">${content}</span>`;
                } else {
                    html += `<span class="${className} inline-block min-w-[0.5em]">&nbsp;</span>`;
                }
            } else {
                html += `<span class="${className}">${content}</span>`;
            }
        }
        
        // Add cursor after the last typed character if not finished
        if (!this.isFinished && this.userInput.length < chars.length) {
            html += '<span class="cursor-blink"></span>';
        }
        
        this.textDisplay.innerHTML = html;
    }
    
    handleInput(e) {
        if (this.isFinished) return;
        
        const value = this.inputCapture.value;
        
        // Prevent input beyond text length
        if (value.length > this.currentText.length) {
            this.inputCapture.value = value.slice(0, this.currentText.length);
            return;
        }
        
        this.userInput = this.inputCapture.value;
        
        // Check for errors in the new input
        let newErrors = 0;
        for (let i = 0; i < this.userInput.length; i++) {
            if (this.userInput[i] !== this.currentText[i]) {
                newErrors++;
            }
        }
        this.errorCount = newErrors;
        this.totalChars = this.userInput.length;
        
        this.renderText();
        this.updateStats();
        this.updateProgress();
        
        // Check if finished
        if (this.userInput.length === this.currentText.length) {
            this.finish();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.startTime = Date.now();
        
        this.timer = setInterval(() => {
            this.updateStats();
        }, 100);
    }
    
    updateStats() {
        if (!this.isRunning || !this.startTime) {
            this.wpmDisplay.textContent = '0';
            this.timeDisplay.textContent = '0:00';
            return;
        }
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const minutes = elapsed / 60;
        
        // Calculate WPM (standard: 5 characters = 1 word)
        const words = this.totalChars / 5;
        const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
        
        // Calculate accuracy
        const accuracy = this.totalChars > 0 
            ? Math.round(((this.totalChars - this.errorCount) / this.totalChars) * 100) 
            : 100;
        
        // Format time
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        this.wpmDisplay.textContent = wpm;
        this.accuracyDisplay.textContent = `${accuracy}%`;
        this.timeDisplay.textContent = timeStr;
        
        // Color code accuracy
        if (accuracy >= 95) {
            this.accuracyDisplay.className = 'text-2xl font-bold text-emerald-400';
        } else if (accuracy >= 85) {
            this.accuracyDisplay.className = 'text-2xl font-bold text-amber-400';
        } else {
            this.accuracyDisplay.className = 'text-2xl font-bold text-rose-400';
        }
    }
    
    updateProgress() {
        const progress = this.currentText.length > 0 
            ? Math.round((this.userInput.length / this.currentText.length) * 100) 
            : 0;
        
        this.progressBar.style.width = `${progress}%`;
        this.progressText.textContent = `${progress}%`;
    }
    
    finish() {
        this.isFinished = true;
        this.isRunning = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const elapsed = (Date.now() - this.startTime) / 1000;
        const minutes = elapsed / 60;
        const words = this.currentText.length / 5;
        const wpm = Math.round(words / minutes);
        const accuracy = Math.round(((this.currentText.length - this.errorCount) / this.currentText.length) * 100);
        
        const mins = Math.floor(elapsed / 60);
        const secs = Math.floor(elapsed % 60);
        const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        // Determine rating
        let rating = '';
        let ratingPercent = 0;
        let ratingColor = '';
        
        if (wpm >= 80 && accuracy >= 95) {
            rating = '大师';
            ratingPercent = 100;
            ratingColor = 'text-purple-400';
        } else if (wpm >= 60 && accuracy >= 90) {
            rating = '优秀';
            ratingPercent = 85;
            ratingColor = 'text-emerald-400';
        } else if (wpm >= 40 && accuracy >= 85) {
            rating = '良好';
            ratingPercent = 70;
            ratingColor = 'text-blue-400';
        } else if (wpm >= 20 && accuracy >= 80) {
            rating = '一般';
            ratingPercent = 50;
            ratingColor = 'text-amber-400';
        } else {
            rating = '需练习';
            ratingPercent = 30;
            ratingColor = 'text-rose-400';
        }
        
        // Show result modal
        this.resultWpm.textContent = wpm;
        this.resultAccuracy.textContent = `${accuracy}%`;
        this.resultTime.textContent = timeStr;
        this.resultErrors.textContent = this.errorCount;
        this.resultRating.textContent = rating;
        this.resultRating.className = `font-medium ${ratingColor}`;
        this.resultRatingBar.style.width = `${ratingPercent}%`;
        
        this.resultModal.classList.remove('hidden');
        setTimeout(() => {
            this.resultContent.classList.remove('scale-95', 'opacity-0');
            this.resultContent.classList.add('scale-100', 'opacity-100');
        }, 10);
        
        // Recreate icons in modal
        lucide.createIcons();
    }
    
    hideResult() {
        this.resultContent.classList.remove('scale-100', 'opacity-100');
        this.resultContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            this.resultModal.classList.add('hidden');
        }, 300);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypingGame();
});
