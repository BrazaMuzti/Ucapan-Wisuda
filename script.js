class GraduationCard {
    constructor() {
        this.currentSection = 0;
        this.sections = document.querySelectorAll('.section');
        this.dots = document.querySelectorAll('.dot');
        this.startX = 0;
        this.endX = 0;
        this.galleryImages = [];
        this.currentGalleryIndex = 0;
        this.sliderImages = [];
        this.currentSlide = 0;
        this.isMusicPlaying = false;
        this.comments = [];
        
        this.init();
    }
    
    init() {
        this.addEventListeners();
        this.showSection(0);
        this.initLightbox();
        this.initSlider();
        this.initMusic();
        this.initComments();
    }
    
    addEventListeners() {
        // Touch events for mobile swipe
        document.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            this.endX = e.changedTouches[0].clientX;
            this.handleSwipe();
        });
        
        // Click events for navigation dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.showSection(index);
            });
        });
        
        // Cover photo upload
        const coverPhotoUpload = document.getElementById('cover-photo-upload');
        const photoContainer = document.querySelector('.photo-container');
        
        photoContainer.addEventListener('click', () => {
            coverPhotoUpload.click();
        });
        
        coverPhotoUpload.addEventListener('change', (e) => {
            this.handleCoverPhotoUpload(e);
        });
        
        // Folder upload functionality
        const folderUpload = document.getElementById('folder-upload');
        const folderUploadBtn = document.querySelector('.folder-upload-btn');
        
        folderUploadBtn.addEventListener('click', () => {
            folderUpload.click();
        });
        
        folderUpload.addEventListener('change', (e) => {
            this.handleFolderUpload(e);
        });
        
        // Slider upload functionality
        const sliderUpload = document.getElementById('slider-upload');
        const uploadSliderBtn = document.querySelector('.upload-slider-btn');
        
        uploadSliderBtn.addEventListener('click', () => {
            sliderUpload.click();
        });
        
        sliderUpload.addEventListener('change', (e) => {
            this.handleSliderUpload(e);
        });
        
        // Keyboard navigation for accessibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSection();
            } else if (e.key === 'ArrowRight') {
                this.nextSection();
            }
        });

        // Share buttons
        this.initShareButtons();
    }
    
    initMusic() {
        this.musicToggle = document.getElementById('music-toggle');
        this.backgroundMusic = document.getElementById('background-music');
        this.musicInfo = document.getElementById('music-info');
        this.musicUpload = document.getElementById('music-upload');
        
        // Set default music info
        this.musicInfo.textContent = 'Musik Wisuda';
        
        // Event listeners untuk musik
        this.musicToggle.addEventListener('click', () => {
            this.toggleMusic();
        });
        
        // Right-click untuk upload musik custom
        this.musicToggle.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.musicUpload.click();
        });
        
        // Handle music upload
        this.musicUpload.addEventListener('change', (e) => {
            this.handleMusicUpload(e);
        });
        
        // Handle music events
        this.backgroundMusic.addEventListener('loadeddata', () => {
            console.log('Musik berhasil dimuat');
        });
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Error loading music:', e);
            this.musicInfo.textContent = 'Error memuat musik';
            this.fallbackToNoMusic();
        });
        
        this.backgroundMusic.addEventListener('ended', () => {
            // Untuk non-loop scenario
            if (!this.backgroundMusic.loop) {
                this.isMusicPlaying = false;
                this.musicToggle.textContent = '🎵';
                this.musicToggle.classList.remove('playing');
            }
        });
        
        // Auto play setelah interaksi user pertama
        this.setupAutoPlay();
    }

    setupAutoPlay() {
        const playMusicAfterInteraction = () => {
            if (!this.isMusicPlaying && this.backgroundMusic.src) {
                this.backgroundMusic.play().then(() => {
                    this.isMusicPlaying = true;
                    this.musicToggle.textContent = '🔊';
                    this.musicToggle.classList.add('playing');
                    this.musicInfo.textContent = 'Musik Diputar';
                }).catch(e => {
                    console.log('Auto-play prevented, waiting for user interaction:', e);
                    // Fallback: tunggu interaksi manual
                });
            }
            
            // Hapus event listener setelah pertama kali dijalankan
            document.removeEventListener('click', playMusicAfterInteraction);
            document.removeEventListener('touchstart', playMusicAfterInteraction);
        };
        
        // Tunggu interaksi user
        document.addEventListener('click', playMusicAfterInteraction, { once: true });
        document.addEventListener('touchstart', playMusicAfterInteraction, { once: true });
        
        // Fallback: coba play setelah 3 detik jika tidak ada interaksi
        setTimeout(() => {
            if (!this.isMusicPlaying && this.backgroundMusic.src) {
                this.backgroundMusic.play().then(() => {
                    this.isMusicPlaying = true;
                    this.musicToggle.textContent = '🔊';
                    this.musicToggle.classList.add('playing');
                }).catch(e => {
                    console.log('Delayed auto-play also prevented');
                });
            }
        }, 3000);
    }

    toggleMusic() {
        if (!this.backgroundMusic.src) {
            this.uploadMusic();
            return;
        }
        
        if (this.isMusicPlaying) {
            this.backgroundMusic.pause();
            this.musicToggle.textContent = '🎵';
            this.musicToggle.classList.remove('playing');
            this.musicInfo.textContent = 'Musik Dijeda';
        } else {
            this.backgroundMusic.play().then(() => {
                this.isMusicPlaying = true;
                this.musicToggle.textContent = '🔊';
                this.musicToggle.classList.add('playing');
                this.musicInfo.textContent = 'Musik Diputar';
            }).catch(e => {
                console.error('Error playing music:', e);
                this.musicInfo.textContent = 'Error memutar musik';
            });
        }
        this.isMusicPlaying = !this.isMusicPlaying;
    }
        
    handleMusicUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Validasi file audio
            if (!file.type.startsWith('audio/')) {
                alert('Silakan pilih file audio yang valid (MP3, WAV, OGG, dll)');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File audio terlalu besar. Maksimal 10MB.');
                return;
            }
            
            const url = URL.createObjectURL(file);
            this.backgroundMusic.src = url;
            this.musicInfo.textContent = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            
            // Auto play setelah upload
            this.backgroundMusic.play().then(() => {
                this.isMusicPlaying = true;
                this.musicToggle.textContent = '🔊';
                this.musicToggle.classList.add('playing');
            }).catch(e => {
                console.error('Error playing uploaded music:', e);
            });
            
            // Clean up object URL ketika musik selesai dimuat
            this.backgroundMusic.addEventListener('loadeddata', () => {
                URL.revokeObjectURL(url);
            }, { once: true });
        }
    }    
    



    
    initSlider() {
        this.sliderContainer = document.querySelector('.slider-container');
        this.slides = document.querySelectorAll('.slide');
        this.thumbnails = document.querySelectorAll('.thumbnail');
        this.sliderDots = document.querySelectorAll('.slider-dots .dot');
        
        // Slider navigation
        document.querySelector('.prev-nav').addEventListener('click', () => {
            this.prevSlide();
        });
        
        document.querySelector('.next-nav').addEventListener('click', () => {
            this.nextSlide();
        });
        
        // Slider dots
        this.sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // Thumbnail clicks
        this.thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // Auto slide (optional)
        this.startAutoSlide();
    }
    
    startAutoSlide() {
        setInterval(() => {
            if (this.currentSection === 2) { // Only auto-slide in photo section
                this.nextSlide();
            }
        }, 5000);
    }
    
    prevSlide() {
        this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length);
    }
    
    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.slides.length);
    }
    
    goToSlide(index) {
        // Hide all slides
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.thumbnails.forEach(thumb => thumb.classList.remove('active'));
        this.sliderDots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        this.slides[index].classList.add('active');
        this.thumbnails[index].classList.add('active');
        this.sliderDots[index].classList.add('active');
        
        this.currentSlide = index;
    }
    
    handleCoverPhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            const coverPhoto = document.getElementById('cover-photo');
            
            reader.onload = (e) => {
                coverPhoto.src = e.target.result;
                coverPhoto.style.display = 'block';
                document.querySelector('.photo-overlay').style.display = 'none';
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    handleSliderUpload(event) {
        const files = Array.from(event.target.files).slice(0, 8); // Limit to 8 images for slider
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Tidak ada file gambar yang dipilih.');
            return;
        }
        
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // Update slide image
                const slideImage = this.slides[index].querySelector('.slide-image');
                slideImage.src = e.target.result;
                slideImage.style.display = 'block';
                
                // Update thumbnail
                const thumbImage = this.thumbnails[index].querySelector('.thumb-image');
                thumbImage.src = e.target.result;
                thumbImage.style.display = 'block';
                
                // Store image data
                this.sliderImages[index] = {
                    src: e.target.result,
                    name: file.name
                };
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    initShareButtons() {
        const shareButtons = document.querySelectorAll('.share-btn');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.dataset.platform;
                this.shareContent(platform);
            });
        });
    }
    
    shareContent(platform) {
        const shareText = "Selamat Wisuda! 🎓 Lihat kartu ucapan spesial ini";
        const shareUrl = window.location.href;
        
        switch(platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('Link berhasil disalin!');
                });
                break;
        }
    }
    
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.startX - this.endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextSection();
            } else {
                this.previousSection();
            }
        }
    }
    
    nextSection() {
        if (this.currentSection < this.sections.length - 1) {
            this.showSection(this.currentSection + 1);
        }
    }
    
    previousSection() {
        if (this.currentSection > 0) {
            this.showSection(this.currentSection - 1);
        }
    }
    
    showSection(index) {
        // Hide all sections
        this.sections.forEach(section => {
            section.classList.remove('active', 'prev', 'next');
        });
        
        // Update dots
        this.dots.forEach(dot => dot.classList.remove('active'));
        this.dots[index].classList.add('active');
        
        // Show current section
        this.sections[index].classList.add('active');
        
        // Add animation classes for adjacent sections
        if (index > 0) {
            this.sections[index - 1].classList.add('prev');
        }
        if (index < this.sections.length - 1) {
            this.sections[index + 1].classList.add('next');
        }
        
        this.currentSection = index;
        
        // Add entrance animation
        this.animateContent(this.sections[index]);
    }
    
    animateContent(section) {
        const content = section.querySelector('.content, .cover-content');
        if (content) {
            content.style.animation = 'none';
            setTimeout(() => {
                content.style.animation = 'slideInUp 0.5s ease-out';
            }, 10);
        }
    }
    
    handleFolderUpload(event) {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Tidak ada file gambar dalam folder yang dipilih.');
            return;
        }
        
        this.galleryImages = [];
        const galleryContainer = document.getElementById('gallery-container');
        galleryContainer.innerHTML = '';
        
        // Sort files by name
        imageFiles.sort((a, b) => a.name.localeCompare(b.name));
        
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const galleryItem = this.createGalleryItem(e.target.result, file.name, index);
                galleryContainer.appendChild(galleryItem);
                
                // Store image data for lightbox
                this.galleryImages.push({
                    src: e.target.result,
                    name: file.name,
                    index: index
                });
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    createGalleryItem(imageSrc, fileName, index) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = fileName;
        
        const filename = document.createElement('div');
        filename.className = 'gallery-filename';
        filename.textContent = fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName;
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(filename);
        
        galleryItem.addEventListener('click', () => {
            this.openLightbox(index);
        });
        
        return galleryItem;
    }
    
    initLightbox() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightbox-image');
        this.lightboxCaption = document.getElementById('lightbox-caption');
        
        // Lightbox event listeners
        document.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox();
        });
        
        document.querySelector('.lightbox-prev').addEventListener('click', () => {
            this.showPreviousImage();
        });
        
        document.querySelector('.lightbox-next').addEventListener('click', () => {
            this.showNextImage();
        });
        
        // Close lightbox when clicking outside image
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Keyboard navigation in lightbox
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeLightbox();
                } else if (e.key === 'ArrowLeft') {
                    this.showPreviousImage();
                } else if (e.key === 'ArrowRight') {
                    this.showNextImage();
                }
            }
        });
    }
    
    openLightbox(index) {
        this.currentGalleryIndex = index;
        const image = this.galleryImages[index];
        
        this.lightboxImage.src = image.src;
        this.lightboxCaption.textContent = image.name;
        this.lightbox.classList.add('active');
        
        document.body.style.overflow = 'hidden';
    }
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    showPreviousImage() {
        if (this.galleryImages.length === 0) return;
        
        this.currentGalleryIndex = (this.currentGalleryIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        const image = this.galleryImages[this.currentGalleryIndex];
        
        this.lightboxImage.src = image.src;
        this.lightboxCaption.textContent = image.name;
    }
    
    showNextImage() {
        if (this.galleryImages.length === 0) return;
        
        this.currentGalleryIndex = (this.currentGalleryIndex + 1) % this.galleryImages.length;
        const image = this.galleryImages[this.currentGalleryIndex];
        
        this.lightboxImage.src = image.src;
        this.lightboxCaption.textContent = image.name;
    }

        initComments() {
        this.commentForm = document.getElementById('comment-form');
        this.commentsList = document.getElementById('comments-list');
        
        // Load existing comments
        this.loadComments();
        
        // Form submission
        this.commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitComment();
        });
    }
    


    async loadComments() {
        try {
            this.commentsList.innerHTML = '<div class="loading-comments">Memuat ucapan...</div>';
            
            // Gunakan approach yang lebih robust
            const timestamp = new Date().getTime(); // Avoid cache
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getComments&t=${timestamp}`, {
                method: 'GET',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                throw new Error(`Network error: ${error.message}`);
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.comments = data.comments || [];
            this.displayComments();
            
        } catch (error) {
            console.error('Error loading comments:', error);
            this.showFallbackComments();
        }
    }

    showFallbackComments() {
        this.commentsList.innerHTML = `
            <div class="no-comments">
                <p>⚠️ Tidak bisa terhubung ke server</p>
                <p style="font-size: 0.8rem; margin-top: 10px;">
                    Fitur komentar sedang offline. Silakan refresh halaman atau coba lagi nanti.
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 10px;
                    padding: 8px 16px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Refresh Halaman</button>
            </div>
        `;
    }

    async submitComment() {
        const formData = new FormData(this.commentForm);
        const commentData = {
            social_media: formData.get('social_media'),
            username: formData.get('username').trim(),
            comment: formData.get('comment').trim(),
            timestamp: new Date().toISOString()
        };
        
        // Validasi
        if (!commentData.social_media || !commentData.username || !commentData.comment) {
            this.showMessage('Harap isi semua field yang diperlukan.', 'error');
            return;
        }
        
        const submitBtn = this.commentForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<span class="submit-icon">⏳</span>Mengirim...';
            submitBtn.disabled = true;

            // Gunakan FormData approach untuk POST
            const formDataToSend = new FormData();
            formDataToSend.append('social_media', commentData.social_media);
            formDataToSend.append('username', commentData.username);
            formDataToSend.append('comment', commentData.comment);
            formDataToSend.append('action', 'addComment');

            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(commentData),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    this.showMessage('🎉 Ucapan berhasil dikirim! Terima kasih', 'success');
                    this.commentForm.reset();
                    
                    // Reload comments setelah 2 detik
                    setTimeout(() => {
                        this.loadComments();
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Gagal mengirim komentar');
                }
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
            
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showMessage(`❌ Gagal mengirim: ${error.message}`, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ... methods lainnya ...

    
    displayComments() {
        if (this.comments.length === 0) {
            this.commentsList.innerHTML = `
                <div class="no-comments">
                    <p>Belum ada ucapan. Jadilah yang pertama mengucapkan selamat! 🎓</p>
                </div>
            `;
            return;
        }
        
        // Sort comments by date (newest first)
        const sortedComments = [...this.comments].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        this.commentsList.innerHTML = sortedComments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="social-badge ${comment.social_media}">
                        ${this.getSocialMediaIcon(comment.social_media)}
                        ${this.getSocialMediaName(comment.social_media)}
                    </span>
                    <span class="username">${this.escapeHtml(comment.username)}</span>
                </div>
                <div class="comment-text">${this.escapeHtml(comment.comment)}</div>
                <div class="comment-date">${this.formatDate(comment.timestamp)}</div>
            </div>
        `).join('');
    }
    
    getSocialMediaIcon(platform) {
        const icons = {
            instagram: '📷',
            facebook: '👥',
            twitter: '🐦',
            tiktok: '🎵',
            whatsapp: '💚',
            linkedin: '💼',
            lainnya: '🌐'
        };
        return icons[platform] || '🌐';
    }
    
    getSocialMediaName(platform) {
        const names = {
            instagram: 'Instagram',
            facebook: 'Facebook',
            twitter: 'Twitter',
            tiktok: 'TikTok',
            whatsapp: 'WhatsApp',
            linkedin: 'LinkedIn',
            lainnya: 'Lainnya'
        };
        return names[platform] || 'Lainnya';
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return 'Hari ini';
        } else if (diffDays === 2) {
            return 'Kemarin';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} hari yang lalu`;
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async submitComment() {
        const formData = new FormData(this.commentForm);
        const commentData = {
            social_media: formData.get('social_media'),
            username: formData.get('username').trim(),
            comment: formData.get('comment').trim(),
            timestamp: new Date().toISOString()
        };
        
        // Validasi
        if (!commentData.social_media || !commentData.username || !commentData.comment) {
            this.showMessage('Harap isi semua field yang diperlukan.', 'error');
            return;
        }
        
        if (commentData.username.length < 2) {
            this.showMessage('Nama harus minimal 2 karakter.', 'error');
            return;
        }
        
        if (commentData.comment.length < 5) {
            this.showMessage('Ucapan harus minimal 5 karakter.', 'error');
            return;
        }
        
        const submitBtn = this.commentForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<span class="submit-icon">⏳</span>Mengirim...';
            submitBtn.disabled = true;
            
            // Kirim ke Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentData)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showMessage('Ucapan berhasil dikirim! Terima kasih 🎓', 'success');
                this.commentForm.reset();
                
                // Reload comments setelah 1 detik
                setTimeout(() => {
                    this.loadComments();
                }, 1000);
                
            } else {
                throw new Error(result.error || 'Failed to submit comment');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            this.showMessage(`Gagal mengirim ucapan: ${error.message}`, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = this.commentForm.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        this.commentForm.insertBefore(messageDiv, this.commentForm.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize the graduation card when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GraduationCard();
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
    // Add confetti effect on cover
    const cover = document.getElementById('cover');
    cover.addEventListener('click', createConfetti);
    
    function createConfetti() {
        const confettiCount = 20;
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.innerHTML = '🎉';
            confetti.style.position = 'fixed';
            confetti.style.fontSize = '20px';
            confetti.style.zIndex = '1000';
            confetti.style.pointerEvents = 'none';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-30px';
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
    
    // Add CSS for confetti animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});