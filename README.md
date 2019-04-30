# PHYser

>We spend 90% of our time in buildings, which consume 40% of our global energy demand, and 100% of new buildings must become nearly zero-energy by 2021. This is why we must redesign them. With our products you take full control of your building’s climate and energy usage, while simultaneously generating green energy in the facade.

[PHYSEE](https://www.physee.eu) is a tech start-up from Delft the Netherlands. Backed by the Delft University of Technology and the Europian Union, we are changing the build environment one window at a time. Our SmartWindows are 100% transparent windows that generate green energy by incorporating solar in the spacer of the window, while also proving sensor data from within the glass.

Our team has decided to leverage MongoDB's quick prototyping capabilities together with it's flexibility in data storage for this project. As the specifications of our sensor data is still evolving on a monthly basis MongoDB offers great flexibility with it's NoSQL database structure. With the great available tools in the community it was easy to quickly prototype our database and app idea.

## PHYSEE HQ LivingLab Monitoring

On top of our new HQ located on the Delft Campus we constructed our LivingLab. The glass addition on the roof of our building functions in our day-to-day worklife as our lunch/yoga/workshop area, but it has a double function. The windows are easily replaceble, making it a perfect location to not only test our own products but also test third party products. We want to create an application and API that can show all our sensor data.

## Software stack

For quick prototyping and due to existing knowledge in our team we opted to develop the app in NodeJS. This allows us to leverage the NodeJS ecosystem for quick web-app development with packages like [ExperssJS](https://expressjs.com) for the web server and the excellent [Mongoose](https://mongoosejs.com) package available to interface with MongoDB straight from NodeJS. We use [Pug](https://pugjs.org/api/getting-started.html) as our templating language and use the amazing [Highcharts](https://www.highcharts.com) for our graphs in the front-end. To round of we use the [Semantic-UI](TODOLINKNEEDED) CSS framework to give a consistent UI feel. To enable authentication we can leverage [PassportJS](http://www.passportjs.org) with a `passport-local-mongoose` strategy to enable the MongoDB to also function as sessions store and authentication database.

### PowerWindows and SmartWindows

The LivingLab has 6 PowerWindows installed since October 2018, of which 3 are SmartWindows. As this is a LivingLab not all windows function all the time, as they might be used for extra development processes.

## Time series data in MongoDB

Our SmartWindow provide sensor data every 5 min and as such this data can be seen as a time series. While there are other database solutions more optimized for pure time-serie management, we needed flexiblity in the configuration of our data structures. MongoDB provides that while also staying performant in the time series operations. We optimized our time-serie entry schema in such a way to we minimize document creation, as outlined in [this excelent blog post by Robert Walters from MongDB](https://www.mongodb.com/blog/post/time-series-data-and-mongodb-part-2-schema-design-best-practices). As our data is rougly send every 5 min, we bucketed our documents in hourly buckets. Our schemas also keep track of the amount of added data entries per document to make averaging easier in when aggregating over larger time spans.

### Schemas

Our bucket document is called `entry` and it in turn has object that holds an array of `dataSchema` entries. As already mentioned in above section he schema has a `sum` object where commonly used data points are summed during addition. Together with the `count` object it makes aggregation of the hourly buckets less CPU intensive.

``` javascript
const entrySchema = new mongoose.Schema({
  node_id: String,
  time: Date,
  data: [dataSchema],
  count: Number,
  sum: {
    solar: Number,
    cons: Number,
    volt: Number,
    temp: Number,
    hum: Number,
    lux: Number,
    press: Number
  }
});
```

The added data entries have their own schema. We won't be using the seperate _id created automatically by MongoDB, so we specificially disable the generated _id in the schema to save disk space.

``` javascript
const dataSchema = new mongoose.Schema({
  time: Date,
  solar: Number,
  cons: Number,
  volt: Number,
  temp: Number,
  hum: Number,
  press: Number,
  light: {
    ir: Number,
    full: Number,
    lux: Number
  },
  pv_power: {
    left: Number,
    bottom: Number,
    right: Number
  }
}, { _id: false });
```
