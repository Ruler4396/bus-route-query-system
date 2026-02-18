package com.service;

import com.alibaba.fastjson.JSONObject;

/**
 * 高德 Web 服务封装
 */
public interface AmapWebService {

    ApiResult getDrivingRoute(String origin, String destination, String waypoints, String strategy);

    ApiResult geocode(String address, String city);

    ApiResult reverseGeocode(String location, Integer radius);

    class ApiResult {
        private boolean success;
        private String message;
        private JSONObject data;

        public static ApiResult ok(JSONObject data) {
            ApiResult result = new ApiResult();
            result.success = true;
            result.message = "ok";
            result.data = data;
            return result;
        }

        public static ApiResult fail(String message) {
            ApiResult result = new ApiResult();
            result.success = false;
            result.message = message;
            result.data = null;
            return result;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public JSONObject getData() {
            return data;
        }
    }
}
