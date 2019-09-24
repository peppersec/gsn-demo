<template>
  <section class="section">
    <div class="columns is-mobile">
      <card
        title="Counter"
        icon="github-circle"
      >
        <b-button @click="increment()">Increment</b-button>
      </card>
    </div>
  </section>
</template>

<script>
import Card from '~/components/Card'
import { mapActions } from 'vuex'

export default {
  name: 'HomePage',

  components: {
    Card
  },
  methods: {
    ...mapActions('gsn', ['increment'])
  }
}
</script>
