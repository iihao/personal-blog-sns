// Blog Admin Dashboard - Flat macOS Style
class BlogAdmin {
    constructor() {
        this.currentView = 'dashboard';
        this.currentUser = null;
        this.posts = [];
        this.media = [];
        this.comments = [];
        this.config = {};
        this.init();
    }

    async init() {
        try {
            // Initialize all components
            await this.loadConfig();
            await this.checkAuth();
            await this.loadPosts();
            await this.loadMedia();
            await this.loadComments();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Show dashboard
            this.showView('dashboard');
        } catch (error) {
            console.error('Failed to initialize admin dashboard:', error);
            this.showError('初始化失败，请刷新页面重试');
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.showView(view);
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Form submissions
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }

        const mediaForm = document.getElementById('media-upload-form');
        if (mediaForm) {
            mediaForm.addEventListener('submit', (e) => this.handleMediaUpload(e));
        }

        const configForm = document.getElementById('config-form');
        if (configForm) {
            configForm.addEventListener('submit', (e) => this.handleConfigSubmit(e));
        }
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/status');
            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.updateUserInfo();
            } else {
                // Redirect to login
                window.location.href = '/admin/login.html';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/admin/login.html';
        }
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const data = await response.json();
                this.config = data.config || {};
                this.updateConfigUI();
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    }

    async loadPosts() {
        try {
            const response = await fetch('/api/posts/all');
            if (response.ok) {
                const data = await response.json();
                this.posts = data.posts || [];
                this.renderPosts();
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    async loadMedia() {
        try {
            const response = await fetch('/api/media');
            if (response.ok) {
                const data = await response.json();
                this.media = data.media || [];
                this.renderMedia();
            }
        } catch (error) {
            console.error('Failed to load media:', error);
        }
    }

    async loadComments() {
        try {
            const response = await fetch('/api/comments');
            if (response.ok) {
                const data = await response.json();
                this.comments = data.comments || [];
                this.renderComments();
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    }

    showView(view) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        
        // Show selected view
        const activeView = document.getElementById(`${view}-view`);
        if (activeView) {
            activeView.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-view="${view}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.currentView = view;
    }

    updateUserInfo() {
        const userDisplay = document.getElementById('user-display');
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = this.currentUser.username || '管理员';
        }
    }

    updateConfigUI() {
        if (this.config.title) {
            document.getElementById('blog-title').value = this.config.title;
        }
        if (this.config.description) {
            document.getElementById('blog-description').value = this.config.description;
        }
    }

    renderPosts() {
        const container = document.getElementById('posts-list');
        if (!container) return;

        if (this.posts.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无文章</div>';
            return;
        }

        const html = this.posts.map(post => `
            <div class="post-card" data-id="${post.id}">
                <div class="post-header">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <div class="post-meta">
                        <span class="post-status ${post.published ? 'published' : 'draft'}">
                            ${post.published ? '已发布' : '草稿'}
                        </span>
                        <span class="post-date">${new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                </div>
                <div class="post-actions">
                    <button class="btn btn-sm btn-primary edit-post" data-id="${post.id}">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-danger delete-post" data-id="${post.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Add event listeners
        document.querySelectorAll('.edit-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.edit-post').dataset.id;
                this.editPost(id);
            });
        });

        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-post').dataset.id;
                this.deletePost(id);
            });
        });
    }

    renderMedia() {
        const container = document.getElementById('media-grid');
        if (!container) return;

        if (this.media.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无媒体文件</div>';
            return;
        }

        const html = this.media.map(item => `
            <div class="media-item" data-id="${item.id}">
                <div class="media-preview">
                    ${item.type === 'image' ? 
                        `<img src="${item.url}" alt="${item.filename}" loading="lazy">` : 
                        `<div class="media-icon"><i class="fas fa-file"></i></div>`
                    }
                </div>
                <div class="media-info">
                    <div class="media-filename">${this.escapeHtml(item.filename)}</div>
                    <div class="media-meta">
                        <span>${this.formatFileSize(item.size)}</span>
                        <span>${new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                </div>
                <button class="media-delete btn btn-sm btn-danger" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        container.innerHTML = html;

        // Add delete event listeners
        document.querySelectorAll('.media-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.media-delete').dataset.id;
                this.deleteMedia(id);
            });
        });
    }

    renderComments() {
        const container = document.getElementById('comments-list');
        if (!container) return;

        if (this.comments.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无评论</div>';
            return;
        }

        const html = this.comments.map(comment => `
            <div class="comment-card" data-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">${this.escapeHtml(comment.author)}</div>
                    <div class="comment-date">${new Date(comment.created_at).toLocaleString('zh-CN')}</div>
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                <div class="comment-post">文章: ${this.escapeHtml(comment.post_title || '未知')}</div>
                <div class="comment-actions">
                    <button class="btn btn-sm btn-danger delete-comment" data-id="${comment.id}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Add delete event listeners
        document.querySelectorAll('.delete-comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.delete-comment').dataset.id;
                this.deleteComment(id);
            });
        });
    }

    async handlePostSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const postData = {
            title: formData.get('title'),
            content: formData.get('content'),
            tags: formData.get('tags'),
            published: formData.get('published') === 'on'
        };

        try {
            let response;
            const postId = form.dataset.postId;
            
            if (postId) {
                // Update existing post
                response = await fetch(`/api/posts/${postId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                });
            } else {
                // Create new post
                response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                });
            }

            if (response.ok) {
                this.showMessage(postId ? '文章更新成功！' : '文章保存成功！');
                await this.loadPosts();
                this.showView('posts');
                form.reset();
                delete form.dataset.postId;
            } else {
                const error = await response.json();
                this.showError(error.message || '保存失败');
            }
        } catch (error) {
            console.error('Post submit error:', error);
            this.showError('保存失败，请检查网络连接');
        }
    }

    async handleMediaUpload(e) {
        e.preventDefault();
        const form = e.target;
        const fileInput = form.querySelector('input[type="file"]');
        
        if (!fileInput.files.length) {
            this.showError('请选择要上传的文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch('/api/media', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.showMessage('文件上传成功！');
                await this.loadMedia();
                form.reset();
            } else {
                const error = await response.json();
                this.showError(error.message || '上传失败');
            }
        } catch (error) {
            console.error('Media upload error:', error);
            this.showError('上传失败，请检查网络连接');
        }
    }

    async handleConfigSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        const configData = {
            title: formData.get('title'),
            description: formData.get('description')
        };

        try {
            const response = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData)
            });

            if (response.ok) {
                this.showMessage('配置保存成功！');
                await this.loadConfig();
            } else {
                const error = await response.json();
                this.showError(error.message || '保存失败');
            }
        } catch (error) {
            console.error('Config submit error:', error);
            this.showError('保存失败，请检查网络连接');
        }
    }

    async editPost(postId) {
        try {
            const response = await fetch(`/api/posts/${postId}`);
            if (response.ok) {
                const post = await response.json();
                
                // Fill form
                document.getElementById('post-title').value = post.title;
                document.getElementById('post-tags').value = post.tags || '';
                document.getElementById('editor').innerHTML = post.content;
                document.getElementById('post-published').checked = post.published;
                
                // Set post ID for update
                document.getElementById('post-form').dataset.postId = postId;
                
                this.showView('create-post');
            }
        } catch (error) {
            console.error('Edit post error:', error);
            this.showError('加载文章失败');
        }
    }

    async deletePost(postId) {
        if (!confirm('确定要删除这篇文章吗？')) return;

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('文章删除成功！');
                await this.loadPosts();
            } else {
                this.showError('删除失败');
            }
        } catch (error) {
            console.error('Delete post error:', error);
            this.showError('删除失败，请检查网络连接');
        }
    }

    async deleteMedia(mediaId) {
        if (!confirm('确定要删除这个文件吗？')) return;

        try {
            const response = await fetch(`/api/media/${mediaId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('文件删除成功！');
                await this.loadMedia();
            } else {
                this.showError('删除失败');
            }
        } catch (error) {
            console.error('Delete media error:', error);
            this.showError('删除失败，请检查网络连接');
        }
    }

    async deleteComment(commentId) {
        if (!confirm('确定要删除这条评论吗？')) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('评论删除成功！');
                await this.loadComments();
            } else {
                this.showError('删除失败');
            }
        } catch (error) {
            console.error('Delete comment error:', error);
            this.showError('删除失败，请检查网络连接');
        }
    }

    async logout() {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                window.location.href = '/admin/login.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/admin/login.html';
        }
    }

    showMessage(message) {
        // Implement message display
        console.log('Message:', message);
    }

    showError(message) {
        // Implement error display
        console.error('Error:', message);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogAdmin();
});

// Rich text editor functions
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}