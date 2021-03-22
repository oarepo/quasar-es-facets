import json
from faker import Faker
import random
import tqdm

fake = Faker()

from config import *

def install_mapping():
  client.indices.delete(index_name, ignore=[400, 404])
  client.indices.create(index_name, json.load(open(mapping_file)))

def generate_text():
  return fake.text()

def generate_integer():
  if random.randint(1, 1000) > 2:
    return random.randint(1, 10)

def generate_float():
  return random.randint(1, 100) / 10

def generate_keyword():
  return fake.first_name()

def generate_boolean():
  return random.randint(1, 10) > 5

def generate_date():
  return fake.date_between(start_date='-5y')

def generate_struct(nesting=0):
  ret = {
      "s": generate_text(),
      "i": generate_integer(),
      "f": generate_float(),
      "k": generate_keyword(),
      "b": generate_boolean(),
      "d": generate_date(),
  }
  if nesting:
    ret['o'] = generate_struct(nesting-1)
  if nesting:
    ret['n'] = generate_struct(nesting-1)
  return ret

def generate_sample_document():
  return generate_struct(nesting=2)

def install_documents():
  for r in tqdm.tqdm(range(10000)):
      client.index(index=index_name, id=r, body=generate_sample_document())

if __name__ == '__main__':
  install_mapping()
  install_documents()

