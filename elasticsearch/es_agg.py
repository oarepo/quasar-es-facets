from config import *
import json

aggs_request = {
    "aggs": {
        "terms-agg": {
            "terms": {
                "field": "k"
            }
        },
        "significant-terms-agg": {
            "significant_terms": {
                "field": "k"
            }
        },
        "significant-text-agg": {
            "significant_text": {
                "field": "s",
                "filter_duplicate_text": True
            }
        },
        "date-histogram-agg": {
            "date_histogram": {
                "field": "d",
                "calendar_interval": "month"
            }
        },
        "auto-date-histogram-agg": {
            "auto_date_histogram": {
                "field": "d",
                "buckets": 10
            }
        },
        "date-range-agg": {
            "date_range": {
                "field": "d",
                "ranges": [
                    { "from": "now-10M/M" },
                    { "to": "now-10M/M", "from": "now-20M/M" },
                    { "to": "now-20M/M" }
                ]
            }
        },
        "histogram-agg": {
            "histogram": {
                "field": "f",
                "interval": 5
            }
        },
        "variable-width-histogram-agg": {
            "variable_width_histogram": {
                "field": "f",
                "buckets": 3
            }
        },
        "missing-agg": {
            "missing": {
                "field": "i"
            }
        },
        "exists-agg": {
            "filter": {
                "exists": {
                    "field": "i"
                }
            }
        },
        "rare-terms-agg": {
            "rare_terms": {
                "field": "k"
            }
        },
        "rare-terms-date-agg": {
             "rare_terms": {
                   "field": "d"
             }
        },
        "range-agg": {
            "range": {
                "field": "i",
                "ranges": [
                    {"to":50},
                    {"from":50}
                ]
            }
        },
        "global-agg": {
            "global": {},
            "aggs": {
                "global-terms-agg": {
                    "terms": {
                        "field": "k"
                    }
                }
            }
        },
        "filter-agg": {
            "filter": { "term": {"k": "John"}},
            "aggs": {
                "filter-terms-agg": {
                    "terms": {
                        "field": "i"
                    }
                },
                "filter-fterms-agg": {
                    "terms": {
                        "field": "f"
                    }
                }
            }
        },
        "filters-agg": {
            "filters": {
                "filters": {
                    "john": { "term": { "k": "John" }},
                    "mary": { "term": { "k": "Mary" }},
                }
            }
        },
        "nested-agg": {
            "nested": {
                "path": "n"
            },
            "aggs": {
                "nested-terms-agg": {
                    "terms": {
                        "field": "n.k"
                    }
                },
            }
        },
        "double-nested-agg": {
            "nested": {
                "path": "n"
            },
            "aggs": {
                "inner-nested-agg": {
                    "nested": {
                        "path": "n.n"
                    },
                    "aggs": {
                        "double-nested-terms-agg": {
                            "terms": {
                                "field": "n.n.k"
                            }
                        }
                    }
                }
            }
        },
        "reverse-nested-agg": {
            "nested": {
                "path": "n"
            },
            "aggs": {
                "reverse-nested-terms": {
                    "terms": {
                          "field": "n.k"
                    },
                    "aggs": {
                        "reverse-nested-reverse": {
                            "reverse_nested": {},
                            "aggs": {
                                "reverse_nested_top-terms": {
                                    "terms": {
                                        "field": "k"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "aggs-in-aggs": {
            "terms": {
                "field": "k"
            },
            "aggs": {
                "aggs-in-aggs-inner": {
                    "range": {
                        "field": "i",
                        "ranges": [
                            {"to":50},
                            {"from":50}
                        ]
                    }
                },
            }
        },
        "extended-stats-agg": {
            "extended_stats": {
                "field": "i"
            }
        }
    },
    "query": {
      "match": {
        "s": "but"
      }
    },
    "size": 0
}

def get_aggs():
    return client.search(index=index_name, body=aggs_request, typed_keys=True)

if __name__ == '__main__':
  print(json.dumps(get_aggs(), indent=4))


"""

Bucket aggregations:
====================

Reverse nested


Unsupported:

IP range
Adjacency matrix

Children/Parent

Composite

Sampler

Diversified sampler

Geo-distance
Geohash grid
Geotile grid

"""
