package com.service.impl;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.mapper.Wrapper;
import com.baomidou.mybatisplus.plugins.Page;
import com.baomidou.mybatisplus.service.impl.ServiceImpl;
import com.dao.TokenDao;
import com.entity.TokenEntity;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.Query;

/**
 * token服务实现
 */
@Service
public class TokenServiceImpl extends ServiceImpl<TokenDao, TokenEntity> implements TokenService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<TokenEntity> page = this.selectPage(new Query<TokenEntity>(params).getPage());
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<TokenEntity> wrapper) {
        Page<TokenEntity> page = this.selectPage(new Query<TokenEntity>(params).getPage(), wrapper);
        return new PageUtils(page);
    }

    @Override
    public List<TokenEntity> selectListView(Wrapper<TokenEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public String generateToken(Long userid, String username, String tableName, String role) {
        // 生成token（24小时后过期）
        String token = UUID.randomUUID().toString().replace("-", "");
        Date expiratedtime = new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000);

        // 删除该用户的旧token
        this.delete(new Wrapper<TokenEntity>() {
            @Override
            public String getSqlSegment() {
                return "userid = " + userid + " AND tablename = '" + tableName + "'";
            }
        });

        // 保存新token
        TokenEntity tokenEntity = new TokenEntity(userid, username, tableName, role, token, expiratedtime);
        tokenEntity.setAddtime(new Date());
        this.insert(tokenEntity);

        return token;
    }

    @Override
    public TokenEntity getTokenEntity(String token) {
        Wrapper<TokenEntity> wrapper = new Wrapper<TokenEntity>() {
            @Override
            public String getSqlSegment() {
                return "token = '" + token + "'";
            }
        };
        return this.selectOne(wrapper);
    }
}
