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
    
ai = AI()
# Apache

#result = ai.register_document(1, 896, "500番台のエラーはサーバー側に問題があるエラーです。HTTP500エラーはperlやphpなどのCGIの記述ミスが殆どで、簡単に言うと「ホームページの作り方(書き方)に問題があって表示できません」という事です。サーバのダウンが原因と回答されている方がいますが、そもそもサーバがダウンすれば500エラーを返すことができないので、ありえない話です。500エラーが返るのは、サーバが正しく動いている(ダウンしていない)証拠です。")
#print(result)
#result = ai.register_document(2, 896, "オフライン作業の意味は分かってるでしょうか・・・オフラインですから、回線の切断を意味します。実際のページには入らず、前に読み込んでパソコンの中に一時保存してあるデータを再度読み込んでそれで見てみるということなので、実際にサイトには入っていません。また、一時保存のものを見るわけですから、行った事の無いサイトは当然オフラインで見ることはできません。なのでオンライン時にHTTP Status 500で入れなかったサイトをオフラインで見ようとするならば、オンライン時のHTTP Status 500を一時保存したものを見るわけですから、オフラインでHTTP Status 500と出るのは当たり前なんです。ページを見るにはまずオンラインでなければなりません。このエラーは主にホームページ作成側、又はサーバーの設定とうによるものなのでこちらからは何も出来ません。あちらがわが修正をかけない限り見る事は出来ません。")
#print(result)
#result = ai.register_document(3, 896, "ブラウザ上　Error 403　ドキュメントにアクセスする権限がありません[状況]　アクセス制限のあるパスにアクセスして拒否された。[対応]　⇒拒否IPのホストからアクセスしてこのメッセージが出るのなら、正常に動作している。　⇒本来許可すべきIPのホストでこのメッセージが出たのなら、「アクセス制御」タブの設定内容を見直す。　(注)拒否IPのホストなのにアクセス制限が効いていないという状況は把握が難しいので(httpd.logで応答コードが 403 になっているかどうかを調べれば確認は可能)、可能であれば設定直後に必ず確認した方がよい(インターネット上では難しいであろうが)。です。")
#print(result)
#result = ai.register_document(4, 896, "掲示板の管理者への問い合わせは、トップページにhttp://www.inverse.jp/perl2/gazou/imgboard_html/3741.htmのスレッドに書き込むように書かれています。同様の質問が下記のように書き込まれていますが、掲示板の管理者からの回答はされていないようです。10/07/14(水)14:50 ID:qLbOdfkI No.95624 先日ブラウザでCookieを食わない設定にしたところ、規制に引っ掛かって自動アク禁(403)になってしまいました…。(しかも原因に数日気付かなかった)現在はCookieを受け入れ、IPも変わったので閲覧できているのですが、アク禁になったIPは自動解除されるのでしょうか？もしされない場合、大変恐縮ですが解除して頂けませんでしょうか。よろしくお願いします。")
#print(result)
#result = ai.register_teacher(1, 896, [1, 2, 3, 4])
#print(result)
#result = ai.register_document(5, 896, "エラーコード500って何")
#print(result)
#result = ai.register_document(6, 896, "HTTP500エラーが表示される")
#print(result)
#result = ai.register_document(7, 896, "ブラウザを立ち上げたが404エラーが返ってきて")
result = ai.get_result(1, 896)
print(result)

