const customToolbar = {
  template: '#toolbar',
  props: ['title', 'action', 'pay']
};

const homePage = {
  template: '#home',
  props: ['toggleMenu', 'payMenu'],
  components: { customToolbar },
  data() {
    return {
      spdVisible: true,
      spdOpen: false,
      hasPurchase: false
    }
  },
  methods: {
    push: function (page) {
      this.$emit('push-page', page)
    },
    formLoad: function () {
      // set current datetime
      $('#datetime').val(new Date().toISOString().substring(0, 16));
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.formLoad()
    })
  },
};

const eventPage = {
  template: '#event',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const foodPage = {
  template: '#food',
  props: ['toggleMenu', 'payMenu'],
  components: { customToolbar },
  data() {
    return {
      pageStack: [page1]
    }
  }
};

const page2 = {
  key: 'page2',
  template: '#page2',
  data() {
    return {
      items: [],
      ss: 10,
      ns: 20,
      quad: 10,
      mcd: 4,
      can2: 1
    }
  },
  methods: {
    createChart: function () {
      var randomScalingFactor = function () {
        return Math.round(Math.random() * 100);
      };
      var config = {
        type: 'pie',
        data: {
          datasets: [{
            data: [
              this.ns,
              this.ss,
              this.quad,
              this.mcd,
              this.can2,
            ],
            backgroundColor: [
              window.chartColors.red,
              window.chartColors.orange,
              window.chartColors.yellow,
              window.chartColors.green,
              window.chartColors.blue,
            ],
            label: 'Dataset 1'
          }],
          labels: [
            'North Spine Canteen',
            'South Spine Canteen',
            'The Quad',
            "McDonald's",
            'Canteen 2'
          ]
        },
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              formatter: (value, ctx) => {

                let sum = 0;
                let dataArr = ctx.chart.data.datasets[0].data;
                dataArr.map(data => {
                  sum += data;
                });
                let percentage = (value * 100 / sum).toFixed(2) + "%";
                return percentage;
              },
              color: '#fff',
            }
          }
        }
      };

      var config2 = {
        type: 'pie',
        data: {
          datasets: [{
            data: [
              30, 20, 20, 15, 15
            ],
            backgroundColor: [
              window.chartColors.red,
              window.chartColors.orange,
              window.chartColors.yellow,
              window.chartColors.green,
              window.chartColors.blue,
            ],
            label: 'Dataset 1'
          }],
          labels: [
            'North Spine Canteen',
            'South Spine Canteen',
            'The Quad',
            "McDonald's",
            'Canteen 2'
          ]
        },
        options: {
          responsive: true
        }
      };

      var ctx = document.getElementById('chart-area').getContext('2d');
      window.myPie = new Chart(ctx, config);
      var ctx2 = document.getElementById('chart-area-2').getContext('2d');
      window.myPie = new Chart(ctx2, config2);
    },
    get: function () {
      axios
        .get('/food_history')
        .then(response => {
          console.log(response.data)
          this.ns = response.data['ns']
          this.ss = response.data['ss']
          this.quad = response.data['quad']
          this.mcd = response.data['mcd']
          this.can2 = response.data['can2']
          this.createChart();
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.get()
    })
  }
};

const page1 = {
  key: 'page1',
  template: '#page1',
  data() {
    return {
      items: [],
      amount: 1
    }
  },
  computed: {
    price: function () {
      return this.amount * 3.20;
    }
  },
  methods: {
    push() {
      this.$emit('push-page', page2);
    },
    post: function () {
      var data = {
        stall_name: document.getElementById('stall_name').value,
        food_name: document.getElementById('food_name').value,
        amount: parseInt(document.getElementById('amount').value),
        price: parseFloat(document.getElementById('price').value)
      }
      console.log(data)
      var me = this
      axios.post('/order_food', data)
        .then(function (response) {
          console.log(response.data)
          if (response.data['is_consume']) {
            alert('Balance remaining: ' + response.data['balance'])
            me.items.length = 0;
            for (i = 0; i < response.data['history'].length; i++) {
              me.items.push({
                timestamp: response.data['history'][i]['timestamp'],
                stall_name: response.data['history'][i]['stall_name'],
                food_name: response.data['history'][i]['food_name'],
                amount: response.data['history'][i]['amount'],
                price: response.data['history'][i]['price']
              })
            }
          } else {
            alert('You do not have enough credit! Please top up at "Menu -> Wallet Topup" before purchasing.\nBalance remaining: ' + response.data['balance'])
          }
        })
        .catch(function (error) {
          alert('Fail:' + error)
        });
    },
    get: function () {
      var me = this
      axios
        .get('/order_food')
        .then(response => {
          console.log(response.data)
          for (i = 0; i < response.data['history'].length; i++) {
            me.items.push({
              timestamp: response.data['history'][i]['timestamp'],
              stall_name: response.data['history'][i]['stall_name'],
              food_name: response.data['history'][i]['food_name'],
              amount: response.data['history'][i]['amount'],
              price: response.data['history'][i]['price']
            })
          }
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.get()
    })
  },
};

const tempPage = {
  template: '#temp',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const busPage = {
  template: '#bus',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const mapPage = {
  template: '#map',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const profilePage = {
  template: '#profile',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
      user_id: 0,
      name: 0,
      email: 0,
      credit_amount: 0
    }
  },
  components: { customToolbar },
  methods: {
    get: function () {
      var me = this
      axios
        .get('/profile')
        .then(response => {
          console.log(response.data)
          me.user_id = response.data['user_id']
          me.name = response.data['name']
          me.email = response.data['email']
          me.credit_amount = response.data['credit_amount']

$('#qrcode').qrcode(me.user_id);
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.get()
    })
  }
};

const libraryPage = {
  template: '#library',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const bookingPage = {
  template: '#booking',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const clinicPage = {
  template: '#clinic',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

const lifestyleTrackPage = {
  template: '#lifestyletrack',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar },
  methods: {
    formLoad: function () {
      $(document).ready(function () {
        // set current datetime
        $('#datetime').val(new Date().toISOString().substring(0, 16));
        // set purchase UI
        $('#hasPurchase').click(function () {
          $("#purchase").toggle(this.checked);
          if (this.checked)
            $("#purchase").attr({ "min": 0.00, "display": block });
          else
            $("#purchase").attr({ "min": -1, "value": -1, "display": none });
        });
      });
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.formLoad()
    })
  }
};

const lifestylePage = {
  template: '#lifestyle',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
      expenses: [],
      activities: [],
      monthly: [0,0,0,0,0,0,0,0,0,0,0,0]
    }
  },
  components: { customToolbar },
  methods: {
    get: function () {
      axios
        .get('/lifestyleshow')
        .then(response => {
          results = response.data
          this.expenses = results[0]
          this.activities = results[1]

          for (i = 0; i < this.expenses.length; i++) {
            date = new Date(this.expenses[i]['timestamp']);
            this.monthly[date.getMonth()]++;
          }
          this.createChart()
          console.log(this.monthly)
          console.log(results)
        })
        .catch(error => {
          console.log(error)
        })
    },
    createChart: function () {
      window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
      };
      window.randomScalingFactor = function () {
        return (Math.random() > 0.5 ? 1.0 : 0.0) * Math.random() * 100;
      };
      var config_loc = {
        type: 'bar',
        data: {
          labels: ['NTU', 'Jurong East', 'Jurong West', 'Jurong North', 'Jurong South', 'Others'],
          datasets: [{
            label: 'Number of Visits',
            backgroundColor: window.chartColors.red,
            borderColor: window.chartColors.red,
            data: [
              randomScalingFactor(),
              randomScalingFactor(),
              randomScalingFactor(),
              randomScalingFactor(),
              randomScalingFactor(),
              randomScalingFactor()
            ],
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Most Visited Location'
          },
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Month'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Amount'
              }
            }]
          }
        }
      };
      var config = {
        type: 'line',
        data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          datasets: [{
            label: 'Expenses',
            backgroundColor: window.chartColors.red,
            borderColor: window.chartColors.red,
            data: this.monthly,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: true,
            text: 'Monthly Expenses'
          },
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Month'
              }
            }],
            yAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Amount'
              }
            }]
          }
        }
      };
      var ctx = $('#expense')[0].getContext('2d');
      window.myLine = new Chart(ctx, config);
      var ctx_loc = $('#location')[0].getContext('2d');
      window.myLine = new Chart(ctx_loc, config_loc);
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.get()
    })
  }
};

const faultPage = {
  template: '#fault',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
      faultList: [],
      modalVisible: false,
      fabVisible: true
    }
  },
  methods: {
    createChart: function () {
      Highcharts.chart('container', {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Average Fault Response Time for the Pass 6 Months (hours)'
        },
        xAxis: {
          categories: ['Aug 18', 'Sep 18', 'Oct 18', 'Nov 18', 'Dec 18', 'Jan 19']
        },
        yAxis: {
          title: {
            text: 'Hours Taken (h)'
          }
        },
        series: [{
          name: 'Electrical',
          data: [10, 10, 12, 14, 15, 12]
        }, {
          name: 'Plumbing',
          data: [4, 6, 3, 6, 8, 10]
        }, {
          name: 'IT',
          data: [2, 3, 5, 2, 1, 3]
        }, {
          name: 'Door Access',
          data: [1, 2, 1, 3, 1, 2]
        }]
      })
    },
    get: function () {
      var me = this
      axios
        .get('/fault/report')
        .then(response => {
          console.log(response.data)
          me.faultList = response.data
        })
        .catch(error => {
          console.log(error)
        })
    },
    showModal() {
      this.modalVisible = true
    }
  },
  components: { customToolbar },
  mounted() {
    this.$nextTick(function () {
      this.get()
      this.createChart()
    })
  },
};

const topupPage = {
  template: '#topup',
  props: ['toggleMenu', 'payMenu', 'title', 'titlefull'],
  data() {
    return {
    }
  },
  components: { customToolbar }
};

Vue.options.delimiters = ["[[", "]]"]

app = new Vue({
  el: '#app',
  template: '#main',
  data() {
    return {
      currentPage: 'Home',
      main_name: "Chong Bing Sheng",
      main_matric: "U1500034F",
      pages: {
        Home: 'Home',
        Food: 'Food Payment',
        Bus: 'NTU Bus',
        Map: 'NTU Map',
        LifestyleTrack: 'Input Your Lifestyle',
        Lifestyle: 'Your Lifestyle',
        Library: 'Library Functions',
        Booking: 'Booking Facilities',
        Clinic: 'Clinic Services',
        Fault: 'Fault Reporting',
        Profile: 'Profile',
        Event: 'Event Description',
        Topup: 'Wallet Topup'
      },
      imgsrc: {
        Home: 'static/src/event.png',
        Food: 'static/src/food.png',
        Bus: 'static/src/bus.png',
        LifestyleTrack: 'static/src/jogging.png',
        Lifestyle: 'static/src/bike.png',
        Library: 'static/src/library.png',
        Booking: 'static/src/booking.png',
        Clinic: 'static/src/clinic.png',
        Fault: 'static/src/faulty.png',
        Map: 'static/src/map.png',
        Topup: 'static/src/topup.png'
      },
      openSide: false
    };
  },
  components: {
    Home: homePage,
    Food: foodPage,
    Bus: busPage,
    Lifestyle: lifestylePage,
    Library: libraryPage,
    Booking: bookingPage,
    Clinic: clinicPage,
    Fault: faultPage,
    Map: mapPage,
    Profile: profilePage,
    Event: eventPage,
    Topup: topupPage
  },
  methods: {
    get: function () {
      var me = this
      axios
        .get('/profile')
        .then(response => {
          console.log(response.data)
          me.main_name = response.data['name']
          me.main_matric = response.data['user_id']
          //          me.email = response.data['email']
          //          me.credit_amount = response.data['credit_amount']
        })
        .catch(error => {
          console.log(error)
        })
    }
  },
  mounted: function () {
    this.$nextTick(function () {
      this.get()
    })
  }
});
