package com.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.entity.GongjiaoluxianEntity;
import com.service.GongjiaoluxianService;
import com.utils.R;

/**
 * 地图接口
 */
@RestController
@RequestMapping("/map")
@CrossOrigin
public class MapController {

    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;

    /**
     * 获取路线地图数据
     */
    @GetMapping("/route/{id}")
    public R getRouteMapData(@PathVariable("id") Long id) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(id);
        if (route == null) {
            return R.error("路线不存在");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", route.getId());
        data.put("luxianbianhao", route.getLuxianbianhao());
        data.put("luxianmingcheng", route.getLuxianmingcheng());
        data.put("qidianzhanming", route.getQidianzhanming());
        data.put("qidianzuobiao", route.getQidianzuobiao());
        data.put("zhongdianzhanming", route.getZhongdianzhanming());
        data.put("zhongdianzuobiao", route.getZhongdianzuobiao());
        data.put("zhandianzuobiao", route.getZhandianzuobiao());
        data.put("tujingzhandian", route.getTujingzhandian());

        return R.ok().put("data", data);
    }

    /**
     * 获取所有路线列表（含坐标）
     */
    @GetMapping("/routes")
    public R getAllRoutes() {
        EntityWrapper<GongjiaoluxianEntity> wrapper = new EntityWrapper<>();
        wrapper.isNotNull("qidianzuobiao");  // 只返回有坐标的路线
        return R.ok().put("data", gongjiaoluxianService.selectList(wrapper));
    }

    /**
     * 解析站点坐标JSON
     * 返回格式：[{name: "站点名", lng: 经度, lat: 纬度}]
     */
    @GetMapping("/stations/{id}")
    public R getRouteStations(@PathVariable("id") Long id) {
        GongjiaoluxianEntity route = gongjiaoluxianService.selectById(id);
        if (route == null) {
            return R.error("路线不存在");
        }

        // 如果有站点坐标JSON数据，直接返回
        if (route.getZhandianzuobiao() != null && !route.getZhandianzuobiao().isEmpty()) {
            return R.ok().put("data", route.getZhandianzuobiao());
        }

        // 否则根据途径站点生成模拟坐标
        String tujingzhandian = route.getTujingzhandian();
        String[] stations = tujingzhandian != null ? tujingzhandian.split("，") : new String[0];

        // 模拟坐标数据（基于上海坐标）
        double baseLng = 121.4737;
        double baseLat = 31.2304;
        double lngStep = 0.005;
        double latStep = 0.003;

        StringBuilder jsonBuilder = new StringBuilder("[");
        for (int i = 0; i < stations.length; i++) {
            if (i > 0) jsonBuilder.append(",");
            jsonBuilder.append("{");
            jsonBuilder.append("\"name\":\"").append(stations[i].trim()).append("\",");
            jsonBuilder.append("\"lng\":").append(baseLng + i * lngStep).append(",");
            jsonBuilder.append("\"lat\":").append(baseLat + i * latStep);
            jsonBuilder.append("}");
        }
        jsonBuilder.append("]");

        return R.ok().put("data", jsonBuilder.toString());
    }
}
