# Tech Assessment for Senior Backend Role

## Overview

Design a backend solution capable of ingesting multiple external datasets stored in JSON format at regular intervals, storing them efficiently, and exposing the data via an API.

## Implementation Notes

- **Ingest data** from multiple external JSON files stored in AWS S3 buckets. For example, two sample JSONs are provided below.
- **JSON file sizes** may range from 1KB to 1GB.
- The choice of the **persistence layer**, **indexing strategy**, and **data model** is up to you—ensure scalability and support for attribute-based querying.
- Store the data in a **unified structure** that allows flexible and efficient retrieval.
- Provide a **single API endpoint** that returns data from all ingested sources, with filtering capabilities on any of the available attributes.

## Data to be Ingested

### Source 1 (~200KB)

URL: <https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json>

### Source 2 (~150MB)

URL: <https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json>

## Core Tech Stack

- **TypeScript**
- **NestJS**
- **MongoDB**
- Other supporting technologies can be chosen at your discretion.

## Sample Data Structure

### Source 1

```json
[
  {
    "id": "some random numeric var with 6 digits",
    "name": "Any human readable property name",
    "address": {
      "country": "some random country",
      "city": "Some random city name belonging to country generated above"
    },
    "isAvailable": true,
    "priceForNight": "any digit between 100 and 1000"
  }
]
```

### Source 2

```json
[
  {
    "id": "some string random generated name 8 unique characters",
    "city": "Some random city name",
    "availability": true,
    "priceSegment": "random generated one of: high/medium/low",
    "pricePerNight": "any digit between 100 and 1000"
  }
]
```

## What to Deliver

- Your code stored in any **Git-compatible platform**.
- A brief explanation of:
  - How to **run your solution**.
  - How you would **extend your solution** if new external JSONs should be supported with different data structures.

## Key Evaluation Criteria

- **Architecture**: Is the design clear, scalable, and maintainable?
- **Data Modeling**: Is the model easy to extend and maintain?
- **Performance**: Have potential performance bottlenecks been considered?
- **Code Quality**: Is the code logically structured and easy to understand? Can new data sources be added with minimal changes?
- **Filtering Logic**: Does filtering work effectively across all attributes, including partial text and numeric ranges?


