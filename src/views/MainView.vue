<template>
   <Sidebar />
 
</template>
<script>
import axios from "axios";
import Sidebar from "@/components/SideBar.vue";

export default {
  name: "MainComponent",
  components: { Sidebar },

  data() {
    return {
      user: null,
    };
  },

  methods: {
    async getUser() {
  try {
    const res = await axios.get("/user");
    this.user = res.data;
    console.log("User data:", this.user);
  } catch (err) {
    console.error("Error fetching user:", err.response?.status || err.message);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      this.$router.push("/login");
    }
  }
}

  },
  mounted() {
    this.getUser();
  },
};
</script>
