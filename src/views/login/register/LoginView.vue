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
                <h3>Admin Login</h3>
                <p class="tagline">Welcome back — tend your fields</p>
            </div>

            <form @submit.prevent="login" class="farm-form">
                <div v-if="error" class="error">{{ error }}</div>

                <label class="field">
                    <span class="icon" aria-hidden="true">📧</span>
                    <input v-model="user.email" type="email" placeholder="Email" required />
                </label>
                <div v-if="errors.email" class="error" style="margin-top:6px">{{ errors.email[0] }}</div>

                <label class="field">
                    <span class="icon" aria-hidden="true">🔒</span>
                    <input v-model="user.password" type="password" placeholder="Password" required />
                </label>
                <div v-if="errors.password" class="error" style="margin-top:6px">{{ errors.password[0] }}</div>

                <button type="submit" class="farm-btn" :disabled="loading">
                    <span class="wheat" aria-hidden="true">🌾</span>
                    <span v-if="!loading">Login</span>
                    <span v-else>Logging in…</span>
                </button>
            </form>

            <!-- <div class="farm-footer">
                <small>New to the farm? <router-link to="/register">Sign up</router-link> to manage crops and schedules.</small>
            </div> -->
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
const router = useRouter()
const user = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref(null)
const errors = ref({})
const userStore = useUserStore()

const login = async () => {
    // reset errors
    errors.value = {}
    error.value = null

    // client-side validation
    if (!user.value.email) {
        errors.value.email = ['The email field is required.']
    }
    if (!user.value.password) {
        errors.value.password = ['The password field is required.']
    }
    if (Object.keys(errors.value).length) return

    loading.value = true
    try {
        // include required role so backend can enforce only admin may login here
        const response = await axios.post('/login', { email: user.value.email, password: user.value.password, role: 'admin' })

        if (response.data && response.data.success) {
            const { token, user: returnedUser } = response.data

            // Store token and set axios header
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            // Store user in Pinia store (which also persists to localStorage)
            userStore.setUser(returnedUser)

            // Redirect based on role
            if (returnedUser && returnedUser.role === 'admin') {
                router.push('/main/dashboard')
            }
        } else {
            error.value = response.data?.message || 'Login failed'
        }
    } catch (err) {
        // handle axios error responses (validation, auth failure, network)
        const resp = err.response?.data || null
        if (err.response && err.response.status === 422 && resp && resp.errors) {
            errors.value = resp.errors
        } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            error.value = resp?.message || 'Invalid credentials.'
        } else {
            console.error('Login error:', err)
            error.value = resp?.message || 'Something went wrong during login.'
        }
    } finally {
        loading.value = false
    }
}
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
.field input {
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

/* Error message */
.error {
    background: #ffecec;
    color: #8a1f1f;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgba(138,31,31,0.08);
    font-size: 0.9rem;
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
.farm-btn[disabled] {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
.farm-btn:hover:not([disabled]) {
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