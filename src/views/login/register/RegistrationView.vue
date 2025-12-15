<template>
    <div class="farm-container">
        <div class="farm-card">
            <div class="farm-header">
                <svg class="barn" viewBox="0 0 64 64" aria-hidden="true">
                    <rect x="8" y="22" width="48" height="34" rx="2" fill="#b44e23"/>
                    <polygon points="32,6 6,24 58,24" fill="#8a2f1b"/>
                    <rect x="22" y="34" width="20" height="22" fill="#fff3df" rx="1"/>
                    <rect x="28" y="40" width="8" height="16" fill="#8a2f1b"/>
                </svg>
                <h3>Farmer Sign Up</h3>
                <p class="tagline">Join the farm — start tending your fields</p>
            </div>

            <form @submit.prevent="save" class="farm-form">
                <div v-if="errors && Object.keys(errors).length" class="error">
                    <ul style="margin:0;padding-left:18px;">
                        <li v-for="(msgs, field) in errors" :key="field">{{ field }}: {{ msgs[0] }}</li>
                    </ul>
                </div>
                <label class="field">
                    <span class="icon" aria-hidden="true">👤</span>
                    <input v-model="user.first_name" type="text" placeholder="First name" required />
                </label>
<!-- 
                <label class="field">
                    <span class="icon" aria-hidden="true">🧾</span>
                    <input v-model="user.middle_name" type="text" placeholder="Middle name" />
                </label> -->

                <label class="field">
                    <span class="icon" aria-hidden="true">👤</span>
                    <input v-model="user.last_name" type="text" placeholder="Last name" required />
                </label>

                <label class="field">
                    <span class="icon" aria-hidden="true">📧</span>
                    <input v-model="user.email" type="email" placeholder="Email" required />
                </label>

                <label class="field">
                    <span class="icon" aria-hidden="true">📱</span>
                    <input v-model="user.phone" type="tel" placeholder="Phone" />
                    <div v-if="errors.phone" class="error" style="margin-top:6px">{{ errors.phone[0] }}</div>
                </label>

<!-- 
                <label class="field">
                    <span class="icon" aria-hidden="true">🏷️</span>
                    <select v-model="user.role">
                        <option value="farmer">Farmer</option>
                        <option value="admin">Admin</option>
                    </select>
                </label> -->

                <label class="field">
                    <span class="icon" aria-hidden="true">🏘️</span>
                    <input v-model="user.barangay" type="text" placeholder="Barangay" required />
                    <div v-if="errors.barangay" class="error" style="margin-top:6px">{{ errors.barangay[0] }}</div>
                </label>

                <label class="field">
                    <span class="icon" aria-hidden="true">🏙️</span>
                    <input v-model="user.municipality" type="text" placeholder="Municipality" required />
                    <div v-if="errors.municipality" class="error" style="margin-top:6px">{{ errors.municipality[0] }}</div>
                </label>

                <label class="field">
                    <span class="icon" aria-hidden="true">📌</span>
                    <input v-model="user.province" type="text" placeholder="Province" required />
                    <div v-if="errors.province" class="error" style="margin-top:6px">{{ errors.province[0] }}</div>
                </label>

                <label class="field">
                    <span class="icon" aria-hidden="true">🎂</span>
                    <input v-model="user.birthdate" type="date" placeholder="Birthdate" required />
                    <div v-if="errors.birthdate" class="error" style="margin-top:6px">{{ errors.birthdate[0] }}</div>
                </label>
                
                <label class="field">
                    <span class="icon" aria-hidden="true">🔒</span>
                    <input v-model="user.password" type="password" placeholder="Password" required />
                </label>

                <label class="field">
                    <span class="icon" aria-hidden="true">🔒</span>
                    <input v-model="user.password_confirmation" type="password" placeholder="Confirm password" required />
                </label>

                <!-- <label class="field">
                    <span class="icon" aria-hidden="true">🌾</span>
                    <input v-model.number="user.years_farming" type="number" min="0" placeholder="Years farming" required />
                    <div v-if="errors.years_farming" class="error" style="margin-top:6px">{{ errors.years_farming[0] }}</div>
                </label> -->

                <button type="submit" class="farm-btn">
                    <span class="wheat" aria-hidden="true">🌾</span>
                    Sign up
                </button>
            </form>

            <div class="farm-footer">
                <small>Already on the farm? <router-link to="/">Log in</router-link></small>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            user: {
                first_name: "",
                last_name: "",
                email: "",
                email_verified_at: null,
                phone: "",
                password: "",
                password_confirmation: "",
                role: "admin",
                barangay: "",
                municipality: "",
                province: "",
                birthdate: null,
                years_farming: 0,
            },
            errors: {},
        };
    },

    methods: {
        async save() {
            // clear previous errors
            this.errors = {}

            // client-side required checks to avoid 422s when obvious
            const localErrors = {}
            if (!this.user.barangay) localErrors.barangay = ['The barangay field is required.']
            if (!this.user.municipality) localErrors.municipality = ['The municipality field is required.']
            if (!this.user.province) localErrors.province = ['The province field is required.']
            if (!this.user.birthdate) localErrors.birthdate = ['The birthdate field is required.']
            if (this.user.years_farming === null || this.user.years_farming === '' || this.user.years_farming === undefined) localErrors.years_farming = ['The years farming field is required.']

            if (Object.keys(localErrors).length) {
                this.errors = localErrors
                return
            }

            try {
                const payload = { ...this.user };

                const response = await axios.post('/register', payload, { headers: { 'Content-Type': 'application/json' } })

                // Backend returns { success, message, data: { user, token } }
                const respData = response.data?.data ?? response.data;

                if (response.status === 200 || response.status === 201) {
                    if (respData?.token) {
                        localStorage.setItem('token', respData.token);
                    }
                    if (respData?.user) {
                        localStorage.setItem('user', JSON.stringify(respData.user));
                    }
                    alert('Account created!');
                    this.$router.push('/');
                } else {
                    console.log('Unexpected response', response.status, response.data);
                }
            } catch (error) {
                const resp = error.response?.data || null
                if (error.response && error.response.status === 422 && resp && resp.errors) {
                    this.errors = resp.errors
                } else if (resp && resp.message) {
                    console.log(resp.message)
                    this.errors = { general: [resp.message] }
                } else {
                    console.log(error.message)
                    this.errors = { general: [error.message] }
                }
            }
        },
    },
};
</script>

<style scoped>
/* Page background: sky to field */
.farm-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #cbe7ff 0%, #f7f2df 60%, #e8d7b0 100%);
    padding: 48px 16px;
    font-family: Georgia, "Times New Roman", serif;
    color: #3b3b2f;
}

/* Card */
.farm-card {
    width: 100%;
    max-width: 420px;
    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,243,230,0.95));
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(50,50,30,0.12);
    padding: 22px;
    border: 2px solid rgba(120,80,40,0.06);
}

/* Header with barn */
.farm-header {
    text-align: center;
    margin-bottom: 14px;
}
.barn {
    width: 64px;
    height: 64px;
    margin: 0 auto 8px;
    filter: drop-shadow(0 1px 0 rgba(0,0,0,0.06));
}
.farm-header h3 {
    margin: 0;
    font-size: 1.35rem;
    color: #6b3e22;
    letter-spacing: 0.5px;
}
.tagline {
    margin: 6px 0 0;
    font-size: 0.85rem;
    color: #7a6b4f;
}

/* Form fields */
.farm-form {
    display: grid;
    gap: 12px;
    margin-top: 6px;
}
.field {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(90deg, rgba(220,200,170,0.12), rgba(240,230,210,0.05));
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid rgba(100,70,40,0.06);
}
.field input,
.field select {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.975rem;
    color: #3b3b2f;
    font-family: inherit;
}
.icon {
    font-size: 1.05rem;
}

/* Button with earthy tone and wheat emoji */
.farm-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: linear-gradient(180deg, #7bb24a 0%, #5f8b2e 100%);
    color: #fffef6;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(95,139,46,0.18);
    transition: transform 120ms ease, box-shadow 120ms ease;
    font-family: inherit;
}
.farm-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 26px rgba(95,139,46,0.22);
}
.wheat {
    font-size: 1.05rem;
}

/* Footer note */
.farm-footer {
    margin-top: 14px;
    text-align: center;
    color: #6e624d;
    font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 420px) {
    .farm-card {
        padding: 16px;
    }
}
</style>
