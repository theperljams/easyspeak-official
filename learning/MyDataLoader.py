import csv
from langchain.embeddings import OpenAIEmbeddings

class MyDataLoader:
    def __init__(self, csv_file):
        self.csv_file = csv_file


    def split_by_rows(self):
        data_chunks = []
        with open(self.csv_file, 'r', newline='') as csvfile:
            csv_reader = csv.reader(csvfile)
        
            for row in csv_reader:
                # Concatenate header and row, and join them as a string
                data_chunks.append(','.join(row))

        return data_chunks




    # def _add_to_vector_store(self, chunk):
    #     # Assuming the last row is the data row
    #     data_row = chunk[-1]
    #     context = ' '.join(data_row)
        
    #     # Assuming you have an OpenAIEmbeddings object and a Chroma vector store
    #     embeddings = OpenAIEmbeddings(openai_api_key=self.api_key)  # Replace with your API key
    #     vector = embeddings.encode(context)
    #     self.vector_store.add_vector(vector)
