package com.controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Date;
import java.util.List;
import java.net.URLEncoder;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.utils.ValidatorUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.baomidou.mybatisplus.mapper.Wrapper;
import com.annotation.IgnoreAuth;

import com.entity.GongjiaoluxianEntity;
import com.entity.view.GongjiaoluxianView;

import com.service.GongjiaoluxianService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MD5Util;
import com.utils.MPUtil;
import com.utils.CommonUtil;
import java.io.IOException;
import com.service.StoreupService;
import com.entity.StoreupEntity;

/**
 * 公交路线
 * 后端接口
 * @author 
 * @email 
 * @date 2022-04-04 22:19:36
 */
@RestController
@RequestMapping("/gongjiaoluxian")
public class GongjiaoluxianController {
    @Autowired
    private GongjiaoluxianService gongjiaoluxianService;

    @Autowired
    private StoreupService storeupService;

    


    /**
     * 后端列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,GongjiaoluxianEntity gongjiaoluxian,
		HttpServletRequest request){
        EntityWrapper<GongjiaoluxianEntity> ew = new EntityWrapper<GongjiaoluxianEntity>();
		PageUtils page = gongjiaoluxianService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, gongjiaoluxian), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前端列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,GongjiaoluxianEntity gongjiaoluxian, 
		HttpServletRequest request){
        EntityWrapper<GongjiaoluxianEntity> ew = new EntityWrapper<GongjiaoluxianEntity>();
		PageUtils page = gongjiaoluxianService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, gongjiaoluxian), params), params));
        return R.ok().put("data", page);
    }

	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( GongjiaoluxianEntity gongjiaoluxian){
       	EntityWrapper<GongjiaoluxianEntity> ew = new EntityWrapper<GongjiaoluxianEntity>();
      	ew.allEq(MPUtil.allEQMapPre( gongjiaoluxian, "gongjiaoluxian")); 
        return R.ok().put("data", gongjiaoluxianService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(GongjiaoluxianEntity gongjiaoluxian){
        EntityWrapper< GongjiaoluxianEntity> ew = new EntityWrapper< GongjiaoluxianEntity>();
 		ew.allEq(MPUtil.allEQMapPre( gongjiaoluxian, "gongjiaoluxian")); 
		GongjiaoluxianView gongjiaoluxianView =  gongjiaoluxianService.selectView(ew);
		return R.ok("查询公交路线成功").put("data", gongjiaoluxianView);
    }
	
    /**
     * 后端详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        GongjiaoluxianEntity gongjiaoluxian = gongjiaoluxianService.selectById(id);
		gongjiaoluxian.setClicknum(gongjiaoluxian.getClicknum()+1);
		gongjiaoluxian.setClicktime(new Date());
		gongjiaoluxianService.updateById(gongjiaoluxian);
        return R.ok().put("data", gongjiaoluxian);
    }

    /**
     * 前端详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        GongjiaoluxianEntity gongjiaoluxian = gongjiaoluxianService.selectById(id);
		gongjiaoluxian.setClicknum(gongjiaoluxian.getClicknum()+1);
		gongjiaoluxian.setClicktime(new Date());
		gongjiaoluxianService.updateById(gongjiaoluxian);
        return R.ok().put("data", gongjiaoluxian);
    }
    


    /**
     * 赞或踩
     */
    @RequestMapping("/thumbsup/{id}")
    public R vote(@PathVariable("id") String id,String type){
        GongjiaoluxianEntity gongjiaoluxian = gongjiaoluxianService.selectById(id);
        if(type.equals("1")) {
        	gongjiaoluxian.setThumbsupnum(gongjiaoluxian.getThumbsupnum()+1);
        } else {
        	gongjiaoluxian.setCrazilynum(gongjiaoluxian.getCrazilynum()+1);
        }
        gongjiaoluxianService.updateById(gongjiaoluxian);
        return R.ok("投票成功");
    }

    /**
     * 后端保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody GongjiaoluxianEntity gongjiaoluxian, HttpServletRequest request){
    	gongjiaoluxian.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
    	//ValidatorUtils.validateEntity(gongjiaoluxian);
        gongjiaoluxianService.insert(gongjiaoluxian);
        return R.ok();
    }
    
    /**
     * 前端保存
     */
	@IgnoreAuth
    @RequestMapping("/add")
    public R add(@RequestBody GongjiaoluxianEntity gongjiaoluxian, HttpServletRequest request){
    	gongjiaoluxian.setId(new Date().getTime()+new Double(Math.floor(Math.random()*1000)).longValue());
    	//ValidatorUtils.validateEntity(gongjiaoluxian);
        gongjiaoluxianService.insert(gongjiaoluxian);
        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    public R update(@RequestBody GongjiaoluxianEntity gongjiaoluxian, HttpServletRequest request){
        //ValidatorUtils.validateEntity(gongjiaoluxian);
        gongjiaoluxianService.updateById(gongjiaoluxian);//全部更新
        return R.ok();
    }
    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        gongjiaoluxianService.deleteBatchIds(Arrays.asList(ids));
        return R.ok();
    }

    /**
     * 导出Excel
     */
    @RequestMapping("/export")
    public void export(@RequestParam Map<String, Object> params, GongjiaoluxianEntity gongjiaoluxian,
                       HttpServletResponse response) throws IOException {
        EntityWrapper<GongjiaoluxianEntity> ew = new EntityWrapper<GongjiaoluxianEntity>();
        List<GongjiaoluxianEntity> records = gongjiaoluxianService.selectList(
            MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, gongjiaoluxian), params), params)
        );

        Workbook workbook = new XSSFWorkbook();
        try {
            Sheet sheet = workbook.createSheet("公交路线");
            String[] headers = {
                "路线编号", "路线名称", "价格", "起点站名", "途径站点", "终点站名",
                "无障碍设施", "无障碍级别", "语音播报", "盲道支持", "导盲犬支持", "创建时间"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
            }

            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (int i = 0; i < records.size(); i++) {
                GongjiaoluxianEntity item = records.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(safeText(item.getLuxianbianhao()));
                row.createCell(1).setCellValue(safeText(item.getLuxianmingcheng()));
                row.createCell(2).setCellValue(item.getJiage() == null ? "" : item.getJiage().toString());
                row.createCell(3).setCellValue(safeText(item.getQidianzhanming()));
                row.createCell(4).setCellValue(safeText(item.getTujingzhandian()));
                row.createCell(5).setCellValue(safeText(item.getZhongdianzhanming()));
                row.createCell(6).setCellValue(safeText(item.getWuzhangaisheshi()));
                row.createCell(7).setCellValue(item.getWuzhangaijibie() == null ? "" : item.getWuzhangaijibie().toString());
                row.createCell(8).setCellValue(item.getYuyintongbao() != null && item.getYuyintongbao() == 1 ? "支持" : "不支持");
                row.createCell(9).setCellValue(item.getMangdaozhichi() != null && item.getMangdaozhichi() == 1 ? "支持" : "不支持");
                row.createCell(10).setCellValue(item.getDitezhichi() != null && item.getDitezhichi() == 1 ? "支持" : "不支持");
                row.createCell(11).setCellValue(item.getAddtime() == null ? "" : sdf.format(item.getAddtime()));
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            String fileName = URLEncoder.encode("gongjiaoluxian-export.xlsx", "UTF-8").replaceAll("\\+", "%20");
            response.reset();
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment;filename*=UTF-8''" + fileName);
            workbook.write(response.getOutputStream());
            response.flushBuffer();
        } finally {
            workbook.close();
        }
    }
    
    /**
     * 提醒接口
     */
	@RequestMapping("/remind/{columnName}/{type}")
	public R remindCount(@PathVariable("columnName") String columnName, HttpServletRequest request, 
						 @PathVariable("type") String type,@RequestParam Map<String, Object> map) {
		map.put("column", columnName);
		map.put("type", type);
		
		if(type.equals("2")) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Calendar c = Calendar.getInstance();
			Date remindStartDate = null;
			Date remindEndDate = null;
			if(map.get("remindstart")!=null) {
				Integer remindStart = Integer.parseInt(map.get("remindstart").toString());
				c.setTime(new Date()); 
				c.add(Calendar.DAY_OF_MONTH,remindStart);
				remindStartDate = c.getTime();
				map.put("remindstart", sdf.format(remindStartDate));
			}
			if(map.get("remindend")!=null) {
				Integer remindEnd = Integer.parseInt(map.get("remindend").toString());
				c.setTime(new Date());
				c.add(Calendar.DAY_OF_MONTH,remindEnd);
				remindEndDate = c.getTime();
				map.put("remindend", sdf.format(remindEndDate));
			}
		}
		
		Wrapper<GongjiaoluxianEntity> wrapper = new EntityWrapper<GongjiaoluxianEntity>();
		if(map.get("remindstart")!=null) {
			wrapper.ge(columnName, map.get("remindstart"));
		}
		if(map.get("remindend")!=null) {
			wrapper.le(columnName, map.get("remindend"));
		}


		int count = gongjiaoluxianService.selectCount(wrapper);
		return R.ok().put("count", count);
	}
	
	/**
     * 前端智能排序
     */
	@IgnoreAuth
    @RequestMapping("/autoSort")
    public R autoSort(@RequestParam Map<String, Object> params,GongjiaoluxianEntity gongjiaoluxian, HttpServletRequest request,String pre){
        EntityWrapper<GongjiaoluxianEntity> ew = new EntityWrapper<GongjiaoluxianEntity>();
        Map<String, Object> newMap = new HashMap<String, Object>();
        Map<String, Object> param = new HashMap<String, Object>();
		Iterator<Map.Entry<String, Object>> it = param.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry<String, Object> entry = it.next();
			String key = entry.getKey();
			String newKey = entry.getKey();
			if (pre.endsWith(".")) {
				newMap.put(pre + newKey, entry.getValue());
			} else if (StringUtils.isEmpty(pre)) {
				newMap.put(newKey, entry.getValue());
			} else {
				newMap.put(pre + "." + newKey, entry.getValue());
			}
		}
		params.put("sort", "clicknum");
        params.put("order", "desc");
		PageUtils page = gongjiaoluxianService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, gongjiaoluxian), params), params));
        return R.ok().put("data", page);
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

}
