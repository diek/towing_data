from flask import Flask, render_template, jsonify
from towing_scraper import get_data, get_color_data, get_make_data, get_location_data, get_state_data
import os


application = Flask(__name__)
application.debug = True


@application.route("/data")
def data():
    return jsonify(get_data())


@application.route("/state_data")
def state_data():
    return jsonify(get_state_data())


@application.route("/make_data")
def make_data():
    return jsonify(get_make_data())


@application.route("/location_data")
def location_data():
    return jsonify(get_location_data())


@application.route("/color_data")
def color_data():
    return jsonify(get_color_data())

@application.route("/display")
def index2():
    return render_template("index2.html")

@application.route("/")
def index():
    return render_template("index.html")


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    application.run(host='0.0.0.0', port=port)
