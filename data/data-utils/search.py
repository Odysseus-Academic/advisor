import typesense
import json


def convert_class_to_jsonl():
    with open("../raw-data/class.json", "r") as input:
        data = json.loads(input.read())
        with open("../search/classes.jsonl", "w") as out:
            for item in data:
                item = data[item]
                out.write(
                    json.dumps(
                        {
                            "id": item["id"],
                            "subjectCode": item["subject"] + "*" + item["code"],
                            "title": item["title"],
                            "desc": item["description"],
                        }
                    )
                    + "\n"
                )


def convert_prof_to_jsonl():
    with open("../raw-data/instructors.json", "r") as input:
        data = json.loads(input.read())
        with open("../search/instructors.jsonl", "w") as out:
            for k, v in dict.items(data):
                out.write(
                    json.dumps(
                        {
                            "id": k,
                            "firstName": capitalize_and_join(v["firstName"]),
                            "lastName": capitalize_and_join(v["lastName"]),
                        }
                    )
                    + "\n"
                )


client = typesense.Client(
    {
        "nodes": [
            {
                "host": "localhost",
                "port": 8108,
                "protocol": "http",
            },
        ],
        "api_key": "zijgRU2wXKE4gMJqm7Xk",
    }
)


def create_schemas():
    course_schema = {
        "name": "courses",
        "fields": [
            {"name": "id", "type": "string"},
            {"name": "subjectCode", "type": "string"},
            {"name": "title", "type": "string"},
            {"name": "desc", "type": "string"},
        ],
    }

    instructor_schema = {
        "name": "instructors",
        "fields": [
            {"name": "id", "type": "string"},
            {"name": "firstName", "type": "string"},
            {"name": "lastName", "type": "string"},
        ],
    }
    client.collections["courses"].delete()
    client.collections["instructors"].delete()

    client.collections.create(course_schema)
    client.collections.create(instructor_schema)


def import_documents():
    with open("../search/classes.jsonl", "r") as f:
        client.collections["courses"].documents.import_(f.read())
    with open("../search/instructors.jsonl", "r") as f:
        client.collections["instructors"].documents.import_(f.read())


def test_search():
    print(
        client.collections["courses"].documents.search(
            {"q": "cs3114", "query_by": "subjectCode,title,desc"}
        )
    )


def capitalize_and_join(name):
    return " ".join(s.capitalize() for s in name.split("-"))


convert_class_to_jsonl()
convert_prof_to_jsonl()
create_schemas()
import_documents()
test_search()