from HttpClient import HttpClient

class AI:
    __httpclient = HttpClient()
    __document_register_url = "http://180.42.27.182/document_analyzer/api/document"
    __teacher_register_url = "http://180.42.27.182/relevance_evaluator/api/teacher"
    __get_result_url = "http://180.42.27.182/relevance_evaluator/api/leaningResult"
    __delete_teacher_url = "http://180.42.27.182/relevance_evaluator/api/deleteTeacher"

    def register_document(self, document_id, category_id, text):
        data = {'documentId': document_id,
                'categoryId': category_id,
                'text': text}

        return self.__httpclient.post(self.__document_register_url, data)
    
    def register_teacher(self, teacher_id, category_id, relevant, not_relevant = None):
        data = {'teacherId': teacher_id,
                'documents': {
                    'relevant': relevant,
                    'notRelevant': not_relevant
                },
                'categoryId': category_id
            }

        return self.__httpclient.post(self.__teacher_register_url, data)
    
    def get_result(self, teacher_id, category_id, offset = None, limit = None, target_documents = None):
        data = {
            'teacherId': teacher_id,
            'offset': offset,
            'limit': limit,
            'targetDocuments': target_documents,
            'categoryId': category_id
        }
        return self.__httpclient.post(self.__get_result_url, data)

    def delete_teacher(self, teacher_ids, category_id):
        data = {'teacherIds': teacher_ids,
                'categoryId': category_id}
        return self.__httpclient.post(self.__delete_teacher_url, data)
