<script setup lang="ts">

</script>

<template>
  <aside class="sidebar">
    <nav class="nav">
      <ul class="menu">
        <li>
          <RouterLink to="/news" class="link">
            {{ $t('sidebar.news') }}
          </RouterLink>
        </li>

        <!-- Solo job seekers -->
        <li>
          <RouterLink to="/job-search" class="link">
            {{ $t('sidebar.jobSearch') }}
          </RouterLink>
        </li>

        <!-- Solo employers -->
        <li>
          <RouterLink to="/job-publish" class="link">
            {{ $t('sidebar.jobPublish') }}
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/profile" class="link">
            {{ $t('sidebar.profile') }}
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/messages" class="link">
            {{ $t('sidebar.messages') }}
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/settings" class="link">
            {{ $t('sidebar.settings') }}
          </RouterLink>
        </li>

        <li class="logout">
          <RouterLink to="/logout" class="link">
            {{ $t('sidebar.logout') }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>


<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: var(--main-color);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
}

.nav {
  width: 100%;
}

.menu {
  padding: 20px 0;
  margin: 0;
}

.menu li {
  list-style: none;
  margin: 4px 0;
}


.link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s ease, padding-left 0.2s ease;
}


.link:hover {
  background-color: var(--main-color-dark);
  padding-left: 26px;
}

.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left: 4px solid white;
  padding-left: 16px;
}

.logout {
  margin-top: 30px;
}

.logout .link:hover {
  background-color: #c0392b;
}

</style>