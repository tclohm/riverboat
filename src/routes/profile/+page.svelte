<script lang="ts">
  import { enhance } from '$app/forms';
  import { Mail, Phone, MapPin, Calendar, Edit2, Save, X } from '@lucide/svelte';
  export let data;

  let isEditing = false;
  let formData = {
    name: data.user?.name || '',
    email: data.user?.email || '',
    phone: data.user?.phone || '',
    location: data.user?.location || '',
    bio: data.user?.bio || '',
  };

  let saveSuccess = false;

  function toggleEdit() {
    if (isEditing) {
      // Reset form if canceling
      formData = {
        name: data.user?.name || '',
        email: data.user?.email || '',
        phone: data.user?.phone || '',
        location: data.user?.location || '',
        bio: data.user?.bio || '',
      };
    }
    isEditing = !isEditing;
  }

  function handleSubmit() {
    saveSuccess = true;
    setTimeout(() => {
      saveSuccess = false;
      isEditing = false;
    }, 2000);
  }

  const joinDate = new Date(data.user?.createdAt || new Date());
  const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
</script>

<svelte:head>
  <title>My Profile - Willie's Keys</title>
</svelte:head>

<div class="profile-container">
  <!-- Header -->
  <header class="profile-header">
    <div class="header-content">
      <h1>My Profile</h1>
      <p>Manage your account settings and personal information</p>
    </div>
  </header>

  <!-- Main Content -->
  <div class="profile-content">
    <!-- Profile Card -->
    <div class="profile-card">
      <!-- Avatar Section -->
      <div class="avatar-section">
        <div class="avatar-large">
          {data.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div class="avatar-info">
          <h2 class="user-name">{data.user?.name || 'User'}</h2>
          <p class="user-email">{data.user?.email || 'user@example.com'}</p>
          <p class="member-since">
            <Calendar size={14} />
            Member since {formattedJoinDate}
          </p>
        </div>
      </div>

      <!-- Edit Button -->
      <button
        type="button"
        class="edit-toggle-btn {isEditing ? 'editing' : ''}"
        on:click={toggleEdit}
      >
        {#if isEditing}
          <X size={18} />
          Cancel
        {:else}
          <Edit2 size={18} />
          Edit Profile
        {/if}
      </button>
    </div>

    <!-- Form Section -->
    {#if isEditing}
      <form method="POST" action="?/updateProfile" use:enhance={handleSubmit} class="profile-form editing">
        <!-- Name -->
        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            bind:value={formData.name}
            placeholder="Enter your full name"
            class="form-input"
          />
        </div>

        <!-- Email (Read-only) -->
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            disabled
            value={formData.email}
            class="form-input readonly"
          />
          <p class="field-note">Email cannot be changed</p>
        </div>

        <!-- Phone -->
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            bind:value={formData.phone}
            placeholder="+1 (555) 123-4567"
            class="form-input"
          />
        </div>

        <!-- Location -->
        <div class="form-group">
          <label for="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            bind:value={formData.location}
            placeholder="City, State"
            class="form-input"
          />
        </div>

        <!-- Bio -->
        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            bind:value={formData.bio}
            placeholder="Tell us about yourself..."
            class="form-textarea"
            rows="4"
          ></textarea>
          <p class="char-count">{formData.bio.length}/160 characters</p>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="submit" class="btn-primary">
            <Save size={18} />
            Save Changes
          </button>
          <button type="button" class="btn-secondary" on:click={toggleEdit}>
            Cancel
          </button>
        </div>

        {#if saveSuccess}
          <div class="success-message">
            ✓ Profile updated successfully!
          </div>
        {/if}
      </form>
    {:else}
      <!-- Display Mode -->
      <div class="profile-details">
        <!-- Details Grid -->
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">
              <Mail size={18} />
              Email
            </div>
            <div class="detail-value">
              {data.user?.email || 'Not provided'}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <Phone size={18} />
              Phone
            </div>
            <div class="detail-value">
              {data.user?.phone || 'Not provided'}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <MapPin size={18} />
              Location
            </div>
            <div class="detail-value">
              {data.user?.location || 'Not provided'}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <Calendar size={18} />
              Member Since
            </div>
            <div class="detail-value">
              {formattedJoinDate}
            </div>
          </div>
        </div>

        <!-- Bio Section -->
        {#if data.user?.bio}
          <div class="bio-section">
            <h3>Bio</h3>
            <p>{data.user.bio}</p>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Stats Section -->
    <div class="stats-section">
      <h3>Account Stats</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{data.passCount || 0}</div>
          <div class="stat-label">Passes Listed</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{data.bookingCount || 0}</div>
          <div class="stat-label">Total Bookings</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{data.rating || 'N/A'}</div>
          <div class="stat-label">Rating</div>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="danger-section">
      <h3>Account Actions</h3>
      <form method="POST" action="?/deleteAccount" class="danger-form">
        <p>Permanently delete your account and all associated data</p>
        <button type="submit" class="btn-danger" onclick="return confirm('Are you sure? This cannot be undone.')">
          Delete Account
        </button>
      </form>
    </div>
  </div>
</div>

<style>
  .profile-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }

  /* Header */
  .profile-header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
  }

  .header-content p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
  }

  /* Profile Card */
  .profile-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
  }

  .avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
  }

  .avatar-info {
    flex: 1;
  }

  .user-name {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }

  .user-email {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #6b7280;
  }

  .member-since {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #9ca3af;
  }

  /* Edit Button */
  .edit-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    transition: all 0.2s ease;
  }

  .edit-toggle-btn:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  .edit-toggle-btn.editing {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #7f1d1d;
  }

  /* Form */
  .profile-form {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .profile-form.editing {
    border-color: #fcd34d;
    background: #fffbeb;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-input.readonly {
    background: #f9fafb;
    cursor: not-allowed;
    color: #6b7280;
  }

  .form-textarea {
    resize: vertical;
    min-height: 100px;
  }

  .field-note {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #9ca3af;
  }

  .char-count {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #9ca3af;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .success-message {
    margin-top: 16px;
    padding: 12px 16px;
    background: #dcfce7;
    color: #166534;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  /* Profile Details (Display Mode) */
  .profile-details {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .detail-item {
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .detail-value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .bio-section {
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .bio-section h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bio-section p {
    margin: 0;
    font-size: 14px;
    color: #4b5563;
    line-height: 1.6;
  }

  /* Stats Section */
  .stats-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .stats-section h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 8px;
    text-align: center;
  }

  .stat-number {
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Danger Zone */
  .danger-section {
    background: white;
    border: 1px solid #fee2e2;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .danger-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 700;
    color: #7f1d1d;
  }

  .danger-form {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .danger-form p {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .btn-danger:hover {
    background: #b91c1c;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .profile-container {
      padding: 16px;
    }

    .profile-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .avatar-section {
      width: 100%;
    }

    .edit-toggle-btn {
      width: 100%;
      justify-content: center;
    }

    .header-content h1 {
      font-size: 24px;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .danger-form {
      flex-direction: column;
      align-items: stretch;
    }

    .btn-danger {
      width: 100%;
    }

    .form-actions {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
      justify-content: center;
    }
  }
</style>
