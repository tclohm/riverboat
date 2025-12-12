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
        <div class="avatar-large">{data.user?.name?.charAt(0).toUpperCase() || 'U'}</div>
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
            class="readonly"
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
      <h3>Danger Zone</h3>
      <p>Permanently delete your account and all associated data</p>
      <form method="POST" action="?/deleteAccount" class="danger-form" on:submit={(e) => !confirm('Are you sure? This cannot be undone.') && e.preventDefault()}>
        <button type="submit" class="btn-danger">
          Delete Account
        </button>      
      </form>
    </div>
  </div>
</div>

<style>
  .profile-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 16px;
  }

  /* Header */
  .profile-header {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 2px solid #d4c4b0;
  }

  .header-content h1 {
    margin: 0 0 8px 0;
    font-size: 32px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .header-content p {
    margin: 0;
    color: #8b7355;
    font-size: 14px;
  }

  /* Profile Card */
  .profile-card {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
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
    border-radius: 2px;
    background: #d9a574;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    border: 2px solid #8b7355;
  }

  .avatar-info {
    flex: 1;
  }

  .user-name {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .user-email {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #8b7355;
  }

  .member-since {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #a0937f;
  }

  /* Edit Button */
  .edit-toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #e8dcc8;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Fredoka', sans-serif;
    color: #5a4a3a;
    transition: all 0.2s ease;
  }

  .edit-toggle-btn:hover {
    background: #d4c4b0;
    border-color: #8b7355;
  }

  .edit-toggle-btn.editing {
    background: rgba(200, 90, 84, 0.1);
    border-color: #c85a54;
    color: #c85a54;
  }

  /* Form */
  .profile-form {
    background: #faf6f0;
    border: 2px solid #d9a574;
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .profile-form.editing {
    border-color: #d9a574;
    background: rgba(217, 165, 116, 0.05);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    font-size: 15px;
    font-family: 'Fredoka', sans-serif;
    background: white;
    color: #5a4a3a;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: #a0937f;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #c85a54;
    box-shadow: 0 0 0 3px rgba(200, 90, 84, 0.1);
    background: #fff;
  }

  .form-group input.readonly {
    background: #e8dcc8;
    cursor: not-allowed;
    color: #8b7355;
    border-color: #d4c4b0;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .field-note {
    margin: 6px 0 0 0;
    font-size: 12px;
    color: #a0937f;
  }

  .char-count {
    margin: 6px 0 0 0;
    font-size: 12px;
    color: #a0937f;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 2px solid #d4c4b0;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 2px;
    border: none;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Fredoka', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: #d9a574;
    color: white;
    border: 2px solid #8b7355;
    flex: 1;
  }

  .btn-primary:hover {
    background: #c85a54;
  }

  .btn-secondary {
    background: white;
    color: #8b7355;
    border: 2px solid #d4c4b0;
    flex: 1;
  }

  .btn-secondary:hover {
    background: #e8dcc8;
    border-color: #8b7355;
  }

  .success-message {
    margin-top: 16px;
    padding: 12px 16px;
    background: rgba(143, 168, 129, 0.15);
    color: #5a7a4a;
    border-radius: 2px;
    font-size: 14px;
    font-weight: 600;
    border-left: 4px solid #8fa881;
  }

  /* Profile Details (Display Mode) */
  .profile-details {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .detail-item {
    padding: 16px;
    background: #faf6f0;
    border-radius: 2px;
    border: 1px solid #e5e7eb;
  }

  .detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .detail-value {
    font-size: 16px;
    font-weight: 600;
    color: #5a4a3a;
  }

  .bio-section {
    padding-top: 24px;
    border-top: 2px solid #d4c4b0;
  }

  .bio-section h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 700;
    color: #5a4a3a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .bio-section p {
    margin: 0;
    font-size: 14px;
    color: #8b7355;
    line-height: 1.6;
  }

  /* Stats Section */
  .stats-section {
    background: white;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .stats-section h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 700;
    color: #5a4a3a;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
    background: #e8dcc8;
    border: 2px solid #d4c4b0;
    border-radius: 2px;
    text-align: center;
  }

  .stat-number {
    font-size: 28px;
    font-weight: 900;
    color: #d9a574;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    color: #8b7355;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Danger Zone */
  .danger-section {
    background: rgba(200, 90, 84, 0.08);
    border: 2px solid #c85a54;
    border-radius: 2px;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .danger-section h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 700;
    color: #c85a54;
  }

  .danger-section p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #8b7355;
  }

  .danger-form {
    display: flex;
    gap: 12px;
  }

  .btn-danger {
    background: #c85a54;
    color: white;
    border: 2px solid #8b7355;
  }

  .btn-danger:hover {
    background: #b84a45;
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .profile-container {
      padding: 0 16px;
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
      font-size: 28px;
    }

    .details-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .danger-form {
      flex-direction: column;
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
