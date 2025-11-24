import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';

const Navbar = () => {
    return (
        <nav style={{
            backgroundColor: 'var(--card-bg)',
            boxShadow: 'var(--shadow-sm)',
            padding: '1rem 0',
            marginBottom: '2rem'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: 0 }}>
                        School Note
                    </h1>
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <NavLink
                        to="/teacher"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius)',
                            backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                            color: isActive ? '#fff' : 'var(--text-color)',
                            transition: 'all 0.2s'
                        })}
                    >
                        <Users size={20} />
                        <span>교사용</span>
                    </NavLink>
                    <NavLink
                        to="/parent"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius)',
                            backgroundColor: isActive ? 'var(--secondary-color)' : 'transparent',
                            color: isActive ? '#fff' : 'var(--text-color)',
                            transition: 'all 0.2s'
                        })}
                    >
                        <GraduationCap size={20} />
                        <span>학생/학부모</span>
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
