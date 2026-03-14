<script setup lang="ts">

</script>

<template>
  <aside class="sidebar">
    <nav>
      <header>
        <img src="../assets/icons/logo.svg" alt="App Logo" class="logo" />
        <h2 class="title">{{ $t('appName') }}</h2>
      </header>
      <ul class="menu">
        <li>
          <RouterLink to="/news" class="link">
            <img src="../assets/icons/Novedades.svg" class="sidebar-image"/>
            <span>{{ $t('sidebar.news') }}</span>
          </RouterLink>
        </li>

        <!-- Solo employee -->
        <li>
          <RouterLink to="/job-search" class="link">
            <img src="../assets/icons/Maletin.svg" class="sidebar-image"/>
            <span>{{ $t('sidebar.jobSearch') }}</span>
          </RouterLink>
        </li>

        <!-- Solo company -->
        <li>
          <RouterLink to="/job-publish" class="link">
            <img src="../assets/icons/Maletin.svg" class="sidebar-image"/>
            <span>{{ $t('sidebar.jobPublish') }}</span>
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/profile" class="link">
            <img src="../assets/icons/Usuario.svg" class="sidebar-image"/>
            <span>{{ $t('sidebar.profile') }}</span>
          </RouterLink>
        </li>

        <!-- Solo employee -->
        <li>
          <RouterLink to="/message/e" class="link">
            <img src="../assets/icons/Mensajes.svg" class="sidebar-image"/> <!--Temp-->
            <span>{{ $t('sidebar.messages') }}</span>
          </RouterLink>
        </li>

        <!-- Solo company -->
         <li>
          <RouterLink to="/message/c" class="link">
            <img src="../assets/icons/Mensajes.svg" class="sidebar-image"/> <!--Temp-->
            <span>{{ $t('sidebar.messages') }}</span>
          </RouterLink>
        </li>

        <li>
          <RouterLink to="/settings" class="link">
            <img src="../assets/icons/Configuracion.svg" class="sidebar-image"/> <!--Temp-->
            <span>{{ $t('sidebar.settings') }}</span>
          </RouterLink>
        </li>

        <li class="logout">
          <RouterLink to="/logout" class="link">
            <img src="../assets/icons/Salir.svg" class="sidebar-image"/> <!--Temp-->
            <span>{{ $t('sidebar.logout') }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>


<style scoped>

.sidebar {
  z-index: 1000;
  position: fixed;
  width: 250px;
  height: 100%;
  background-color: var(--main-color);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
}

/*Header*/
header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid rgba(255, 255, 255, 0.5);
  padding: 1rem;
  background-color: var(--main-color-05);
}
.title {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  padding: 5px;
  margin: 0;
}
.logo {
  width: 40px;
  height: 40px;
}

span{
  color: white;
}

/*Options*/
nav {
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

.sidebar-image{
  filter: invert(); /*Icons are black*/
}

.link {
  display: flex;
  align-items: center;
  padding: 12px 20px;

  gap: 1rem;

  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;

  transition: background-color 0.2s ease, padding-left 0.2s ease;
}


.link:hover {
  background-color: var(--main-color-05);
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