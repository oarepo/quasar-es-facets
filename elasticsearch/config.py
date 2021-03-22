es_url = 'http://localhost:9200'
mapping_file = 'mapping.json'
index_name = 'quasar-es-facets'


import elasticsearch
client = elasticsearch.Elasticsearch(hosts=[es_url])

