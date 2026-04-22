# Ireland Bus Tracking

Ireland Bus Tracking is a real-time and predictive public bus tracking project for Ireland.

The first implementation focuses on Galway as the MVP city. The system is designed to start with one city, validate the data pipeline and prediction strategy, and then expand progressively to other Irish cities.

## MVP Scope

The initial version targets Galway city buses using Transport for Ireland data.

Current goals:

- collect and store real-time GTFS-RT bus data
- analyze the first collected historical dataset
- build a simple baseline for delay and arrival estimation
- prepare the architecture for future machine learning models
- create a PWA that users can open on mobile to track buses and expected arrivals

## Current Data Status

The project currently has around 4 days of collected bus data.

This is enough to validate ingestion, database structure, route coverage, and initial exploratory analysis. It is not yet enough for a reliable predictive model, so the first modelling phase should focus on simple baselines and data quality checks.

As more historical data is collected, the project will move towards training machine learning models that can predict:

- estimated arrival time at a stop
- expected delay by route, stop, day, and time
- future vehicle position over a short time window

## Prediction Strategy

The main prediction engine should use machine learning models designed for time, location, and transport data rather than a language model.

Recommended future models include:

- XGBoost or LightGBM for delay and ETA prediction
- geospatial sequence models for short-term vehicle position prediction
- GTFS route and shape data for map matching and route-aware predictions

A language model can be added later as an assistant layer, for example to answer user questions such as "when will the 409 arrive at Eyre Square?", but it should not be the core prediction engine.

## Long-Term Vision

Ireland Bus Tracking starts in Galway and expands city by city.

The long-term goal is to provide a national bus tracking and prediction platform that combines official real-time transport data, historical delay patterns, and user-friendly mobile access.
